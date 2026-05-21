/**
 * @file src/server/routes/ai.ts
 * Безопасный прокси к KIE.AI API.
 *
 * ВСЕ запросы к KIE.AI идут через этот маршрут — API-ключ никогда
 * не покидает сервер и не виден в браузере.
 *
 * POST   /api/ai/image           — генерация изображения
 * POST   /api/ai/video           — генерация видео
 * POST   /api/ai/music           — генерация музыки (Suno)
 * POST   /api/ai/chat            — чат с ИИ-ассистентом
 * GET    /api/ai/job/:id         — статус задачи (polling)
 * POST   /api/ai/callback        — webhook от KIE.AI (внутренний)
 * GET    /api/ai/jobs            — история задач пользователя
 */

import type { FastifyInstance, FastifyRequest } from 'fastify';
import { getDb, queryAll, queryOne, execute, newId } from '../services/database.js';
import {
  generateImage,
  generateVideo,
  generateMusic,
  chat,
  getTaskStatus,
  getMusicStatus,
  KieError,
  type KieCallbackBody,
} from '../services/kie.js';
import type {
  AiJob,
  KieImageRequest,
  KieVideoRequest,
  KieMusicRequest,
  KieChatRequest,
} from '../../../shared/types.js';

/** Оборачивает вызов KIE.AI: создаёт job в БД, запускает генерацию */
async function startJob(
  db: ReturnType<typeof getDb>,
  type: AiJob['type'],
  prompt: string,
  options: Record<string, unknown>,
  kieTaskIdPromise: Promise<string>,
): Promise<AiJob> {
  const id = newId();

  // Создаём job со статусом 'queued'
  execute(db,
    "INSERT INTO ai_jobs (id, type, status, prompt, options) VALUES (?, ?, 'queued', ?, ?)",
    [id, type, prompt, JSON.stringify(options)],
  );

  // Запускаем задачу асинхронно (не блокируем ответ клиенту)
  kieTaskIdPromise
    .then(kieTaskId => {
      execute(db,
        "UPDATE ai_jobs SET kie_task_id = ?, status = 'processing', updated_at = datetime('now') WHERE id = ?",
        [kieTaskId, id],
      );
    })
    .catch((err: Error) => {
      execute(db,
        "UPDATE ai_jobs SET status = 'failed', error = ?, updated_at = datetime('now') WHERE id = ?",
        [err.message, id],
      );
    });

  return queryOne<AiJob>(db, 'SELECT * FROM ai_jobs WHERE id = ?', [id])!;
}

export default async function aiRoutes(app: FastifyInstance) {
  const db = getDb();

  // ── POST /api/ai/image ────────────────────────────────────────
  app.post<{ Body: KieImageRequest }>(
    '/api/ai/image',
    async (req, reply) => {
      const { prompt, width = 1024, height = 1024 } = req.body;

      if (!prompt?.trim()) {
        return reply.status(400).send({ ok: false, error: 'Промпт обязателен' });
      }

      try {
        const job = await startJob(
          db, 'text-to-image', prompt, { width, height },
          generateImage({ prompt, width, height }),
        );
        return reply.status(202).send({ ok: true, data: job });
      } catch (err) {
        if (err instanceof KieError) {
          return reply.status(err.statusCode).send({ ok: false, error: err.message });
        }
        throw err;
      }
    },
  );

  // ── POST /api/ai/video ────────────────────────────────────────
  app.post<{ Body: KieVideoRequest }>(
    '/api/ai/video',
    async (req, reply) => {
      const { prompt, duration = 5, ratio = '16:9' } = req.body;

      if (!prompt?.trim()) {
        return reply.status(400).send({ ok: false, error: 'Промпт обязателен' });
      }

      try {
        const job = await startJob(
          db, 'text-to-video', prompt, { duration, ratio },
          generateVideo({ prompt, duration, ratio }),
        );
        return reply.status(202).send({ ok: true, data: job });
      } catch (err) {
        if (err instanceof KieError) {
          return reply.status(err.statusCode).send({ ok: false, error: err.message });
        }
        throw err;
      }
    },
  );

  // ── POST /api/ai/music ────────────────────────────────────────
  app.post<{ Body: KieMusicRequest }>(
    '/api/ai/music',
    async (req, reply) => {
      const { prompt, ...rest } = req.body;

      if (!prompt?.trim()) {
        return reply.status(400).send({ ok: false, error: 'Промпт обязателен' });
      }

      try {
        const job = await startJob(
          db, 'text-to-music', prompt, rest as Record<string, unknown>,
          generateMusic({ prompt, ...rest }),
        );
        return reply.status(202).send({ ok: true, data: job });
      } catch (err) {
        if (err instanceof KieError) {
          return reply.status(err.statusCode).send({ ok: false, error: err.message });
        }
        throw err;
      }
    },
  );

  // ── POST /api/ai/chat ─────────────────────────────────────────
  app.post<{ Body: KieChatRequest }>(
    '/api/ai/chat',
    async (req, reply) => {
      const { messages, model, temperature, max_tokens } = req.body;

      if (!messages?.length) {
        return reply.status(400).send({ ok: false, error: 'Сообщения обязательны' });
      }

      try {
        const chatReq: KieChatRequest = { messages };
        if (model !== undefined)       chatReq.model       = model;
        if (temperature !== undefined) chatReq.temperature = temperature;
        if (max_tokens !== undefined)  chatReq.max_tokens  = max_tokens;

        const content = await chat(chatReq);
        return reply.send({ ok: true, data: { content } });
      } catch (err) {
        if (err instanceof KieError) {
          return reply.status(502).send({ ok: false, error: err.message });
        }
        throw err;
      }
    },
  );

  // ── GET /api/ai/job/:id ───────────────────────────────────────
  // Polling статуса задачи. Клиент вызывает каждые 3 секунды.
  app.get<{ Params: { id: string } }>('/api/ai/job/:id', async (req, reply) => {
    const job = queryOne<AiJob>(db, 'SELECT * FROM ai_jobs WHERE id = ?', [req.params.id]);

    if (!job) {
      return reply.status(404).send({ ok: false, error: 'Задача не найдена' });
    }

    // Если есть kieTaskId и задача ещё в процессе — синхронно спрашиваем KIE.AI
    if (job.kie_task_id && job.status === 'processing') {
      try {
        const isMusicJob = job.type === 'text-to-music';
        const result = isMusicJob
          ? await getMusicStatus(job.kie_task_id)
          : await getTaskStatus(job.kie_task_id);

        if (result.status !== 'processing') {
          execute(db,
            "UPDATE ai_jobs SET status = ?, result_url = ?, error = ?, updated_at = datetime('now') WHERE id = ?",
            [result.status, result.resultUrl, result.error, job.id],
          );
        }

        const updated = queryOne<AiJob>(db, 'SELECT * FROM ai_jobs WHERE id = ?', [job.id]);
        return reply.send({ ok: true, data: updated });
      } catch { /* Возвращаем текущий статус из БД если KIE.AI недоступен */ }
    }

    return reply.send({ ok: true, data: job });
  });

  // ── GET /api/ai/jobs ──────────────────────────────────────────
  app.get('/api/ai/jobs', async (_req, reply) => {
    const jobs = queryAll<AiJob>(
      db,
      'SELECT * FROM ai_jobs ORDER BY created_at DESC LIMIT 50',
    );
    return reply.send({ ok: true, data: jobs });
  });

  // ── POST /api/ai/callback ─────────────────────────────────────
  // Webhook: KIE.AI вызывает этот endpoint когда задача выполнена
  app.post<{ Body: KieCallbackBody }>(
    '/api/ai/callback',
    async (req, reply) => {
      const { taskId, status, data } = req.body;

      const fileUrl = data?.audio_url ?? data?.imageUrl ?? data?.videoUrl ?? null;

      const internalStatus = (status === 'complete' || status === 'success')
        ? 'success'
        : status === 'failed' ? 'failed' : 'processing';

      execute(db,
        "UPDATE ai_jobs SET status = ?, result_url = ?, updated_at = datetime('now') WHERE kie_task_id = ?",
        [internalStatus, fileUrl, taskId],
      );

      // TODO: отправить событие через WebSocket клиентам

      return reply.send({ ok: true });
    },
  );
}
