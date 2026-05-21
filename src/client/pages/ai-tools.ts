/**
 * @file src/client/pages/ai-tools.ts
 * TypeScript-модуль для страницы ИИ инструментов.
 *
 * Заменяет инлайновый JS в ai-tools.html.
 * API-ключ здесь ОТСУТСТВУЕТ — все запросы идут через /api/ai/*.
 *
 * Возможности:
 *  • Генерация изображений, видео, музыки
 *  • Чат с ИИ-ассистентом
 *  • Polling статуса задач с прогресс-баром
 *  • История задач (последние 50)
 *  • WebSocket для real-time обновлений
 */

import { AI, connectWs } from '@client/api/http';
import type { AiJob, KieChatMessage } from '@shared/types';

// ── Состояние ────────────────────────────────────────────────────

interface AppState {
  activeCat: string;
  activeTool: string;
  chatHistory: KieChatMessage[];
  isChatLoading: boolean;
  pollingTimers: Map<string, ReturnType<typeof setInterval>>;
}

const state: AppState = {
  activeCat:     'chat',
  activeTool:    'chat',
  chatHistory:   [],
  isChatLoading: false,
  pollingTimers: new Map(),
};

// ── Категории и инструменты ──────────────────────────────────────

interface ToolItem {
  id: string;
  label: string;
  desc: string;
  accept: string | null;
}

interface Category {
  id: string;
  label: string;
  icon: string;
  items: ToolItem[];
}

const CATS: Category[] = [
  {
    id: 'video', label: 'Генерация видео', icon: '🎬',
    items: [
      { id: 'text-to-video',   label: 'Текст в видео',         desc: 'Создание видео из текстового описания',   accept: null },
      { id: 'image-to-video',  label: 'Изображение в видео',   desc: 'Оживите статичное изображение',           accept: 'image/*' },
      { id: 'video-to-video',  label: 'Видео в видео',         desc: 'Преобразование стиля видео',              accept: 'video/*' },
      { id: 'video-editing',   label: 'Редактирование видео',  desc: 'Умное редактирование по описанию',        accept: 'video/*' },
      { id: 'speech-to-video', label: 'Речь в видео',          desc: 'Генерация видео на основе речи',         accept: 'audio/*' },
      { id: 'lip-sync',        label: 'Синхронизация губ',     desc: 'Синхронизация движения губ с аудио',     accept: 'video/*' },
    ],
  },
  {
    id: 'image', label: 'Генерация изображений', icon: '🖼️',
    items: [
      { id: 'text-to-image',  label: 'Текст в изображение',         desc: 'Генерация изображения по описанию',    accept: null },
      { id: 'image-to-image', label: 'Изображение в изображение',   desc: 'Преобразование стиля и содержимого',   accept: 'image/*' },
      { id: 'image-editing',  label: 'Редактирование изображений',  desc: 'Умное редактирование по инструкции',   accept: 'image/*' },
    ],
  },
  {
    id: 'music', label: 'Генерация музыки', icon: '🎵',
    items: [
      { id: 'text-to-music', label: 'Текст в музыку', desc: 'Создание музыки из текстового описания', accept: null },
    ],
  },
  {
    id: 'speech', label: 'Речь', icon: '🔊',
    items: [
      { id: 'speech-to-text', label: 'Речь в текст',  desc: 'Транскрипция аудио и видеозаписей',     accept: 'audio/*,video/*' },
      { id: 'text-to-speech', label: 'Текст в речь',  desc: 'Синтез реалистичной речи из текста',    accept: null },
      { id: 'audio-to-audio', label: 'Аудио в аудио', desc: 'Изменение голоса, шумоподавление',      accept: 'audio/*' },
    ],
  },
  {
    id: 'chat', label: 'Чат', icon: '💬',
    items: [
      { id: 'chat', label: 'Чат', desc: 'Диалог с ИИ-ассистентом', accept: null },
    ],
  },
];

// ── Инициализация ────────────────────────────────────────────────

export function init(): void {
  buildSidebar();
  openAllCats();
  selectTool('chat', 'chat');

  // Real-time обновления через WebSocket
  connectWs((event) => {
    if (event.type === 'ai_job:update') {
      const job = event.payload as Pick<AiJob, 'id' | 'status' | 'result_url' | 'error'>;
      onJobUpdate(job);
    }
  });
}

// ── Сайдбар ──────────────────────────────────────────────────────

function buildSidebar(): void {
  const sb = document.getElementById('aiSidebar');
  if (!sb) return;

  sb.innerHTML = CATS.map(cat => `
    <div class="ai-cat" id="cat-${cat.id}">
      <div class="ai-cat-head" onclick="toggleCat('${cat.id}')">
        <span class="cat-icon">${cat.icon}</span>
        <span>${cat.label}</span>
        <svg class="cat-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
      <div class="ai-cat-items">
        ${cat.items.map(item => `
          <div class="ai-item" id="item-${item.id}" onclick="selectTool('${item.id}','${cat.id}')">
            ${item.label}
          </div>`).join('')}
      </div>
    </div>`).join('');
}

function openAllCats(): void {
  CATS.forEach(c => document.getElementById(`cat-${c.id}`)?.classList.add('open'));
}

/** Переключение открытости категории */
window.toggleCat = (id: string) => {
  document.getElementById(`cat-${id}`)?.classList.toggle('open');
};

/** Переключение активного инструмента */
window.selectTool = (toolId: string, catId: string) => {
  state.activeTool = toolId;
  state.activeCat  = catId;

  document.querySelectorAll('.ai-item').forEach(el => el.classList.remove('active'));
  document.getElementById(`item-${toolId}`)?.classList.add('active');
  document.getElementById(`cat-${catId}`)?.classList.add('open');

  const cat  = CATS.find(c => c.id === catId);
  const tool = cat?.items.find(t => t.id === toolId);
  if (!tool || !cat) return;

  document.getElementById('toolTitle')!.textContent = tool.label;

  if (toolId === 'chat') {
    renderChat();
  } else {
    renderTool(tool, cat);
  }
};

// ── Рендер инструмента ───────────────────────────────────────────

function renderTool(tool: ToolItem, cat: Category): void {
  const needsUpload = tool.accept !== null;
  const needsPrompt = !tool.accept || tool.id.includes('editing') || tool.id.includes('to-video') || tool.id.includes('to-image');

  const main = document.getElementById('aiMain')!;
  main.innerHTML = `
    <div class="tool-topbar">
      <div class="tool-icon-big">${cat.icon}</div>
      <div>
        <div class="tool-title">${tool.label}</div>
        <div class="tool-subtitle">${tool.desc}</div>
      </div>
      <div class="api-badge" style="margin-left:auto;">
        <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" fill="#3ECF61"/></svg>
        API активен
      </div>
    </div>
    <div class="tool-body">
      ${needsPrompt ? `
      <div class="tool-section">
        <div class="tool-label">Описание / промпт</div>
        <textarea class="tool-textarea" id="toolPrompt" placeholder="Опишите что хотите получить...">${getDefaultPrompt(tool.id)}</textarea>
      </div>` : ''}

      ${needsUpload ? `
      <div class="tool-section">
        <div class="tool-label">Загрузить файл</div>
        <label class="tool-upload" for="fileInput">
          <div class="tool-upload-icon">${uploadIcon(tool.accept)}</div>
          <div class="tool-upload-label" id="uploadLabel">
            Нажмите или перетащите файл<br>
            <span style="font-size:11px;color:var(--text-muted);margin-top:4px;display:block;">${acceptLabel(tool.accept)}</span>
          </div>
          <input type="file" id="fileInput" accept="${tool.accept ?? ''}" style="display:none;" onchange="handleFileSelect(this)"/>
        </label>
      </div>` : ''}

      <div style="display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap;">
        ${renderToolOptions(tool.id)}
      </div>

      <button class="btn btn-primary" id="genBtn" onclick="runGenerate('${tool.id}','${cat.id}')" style="margin-bottom:20px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Сгенерировать
      </button>

      <div class="tool-section">
        <div class="tool-label">Результат</div>
        <div class="tool-output" id="toolOutput">
          <div style="display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.5;">
            <div style="font-size:28px;">${cat.icon}</div>
            <div style="font-size:12px;">Здесь появится результат</div>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Запуск генерации ─────────────────────────────────────────────

window.runGenerate = async (toolId: string, catId: string) => {
  const btn    = document.getElementById('genBtn') as HTMLButtonElement;
  const output = document.getElementById('toolOutput')!;
  const prompt = (document.getElementById('toolPrompt') as HTMLTextAreaElement | null)?.value?.trim() ?? '';

  if (!prompt) {
    showOutputError('Введите описание (промпт) для генерации');
    return;
  }

  setGenerating(btn, true);
  showOutputLoading(output, catId);

  try {
    let job: AiJob;

    if (toolId === 'text-to-image' || toolId === 'image-to-image' || toolId === 'image-editing') {
      job = await AI.generateImage({ prompt });
    } else if (toolId.includes('video') || toolId === 'lip-sync' || toolId === 'speech-to-video') {
      job = await AI.generateVideo({ prompt });
    } else if (toolId === 'text-to-music') {
      job = await AI.generateMusic({ prompt });
    } else {
      // Для text-to-speech, audio-to-audio и других — используем image API как заглушку
      job = await AI.generateImage({ prompt });
    }

    // Запускаем polling
    startPolling(job.id, toolId, output);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
    showOutputError(`Ошибка: ${message}`);
    setGenerating(btn, false);
  }
};

/** Polling статуса каждые 3 секунды */
function startPolling(jobId: string, toolId: string, outputEl: HTMLElement): void {
  const btn = document.getElementById('genBtn') as HTMLButtonElement | null;

  // Очистить предыдущий polling если был
  const prev = state.pollingTimers.get(jobId);
  if (prev) clearInterval(prev);

  const timer = setInterval(async () => {
    try {
      const job = await AI.getJob(jobId);

      if (job.status === 'success') {
        clearInterval(timer);
        state.pollingTimers.delete(jobId);
        if (btn) setGenerating(btn, false);
        showOutputResult(outputEl, toolId, job.result_url);
      } else if (job.status === 'failed') {
        clearInterval(timer);
        state.pollingTimers.delete(jobId);
        if (btn) setGenerating(btn, false);
        showOutputError(job.error ?? 'Задача завершилась с ошибкой');
      }
      // Иначе — 'queued' | 'processing' — продолжаем polling
    } catch {
      // Не прерываем polling при сетевой ошибке
    }
  }, 3000);

  state.pollingTimers.set(jobId, timer);
}

/** Вызывается при WebSocket-событии ai_job:update */
function onJobUpdate(job: Pick<AiJob, 'id' | 'status' | 'result_url' | 'error'>): void {
  const timer = state.pollingTimers.get(job.id);
  if (!timer) return; // не наш job

  if (job.status === 'success' || job.status === 'failed') {
    clearInterval(timer);
    state.pollingTimers.delete(job.id);

    const btn    = document.getElementById('genBtn') as HTMLButtonElement | null;
    const output = document.getElementById('toolOutput');
    if (btn) setGenerating(btn, false);
    if (output) {
      if (job.status === 'success') showOutputResult(output, state.activeTool, job.result_url);
      else showOutputError(job.error ?? 'Ошибка генерации');
    }
  }
}

// ── UI helpers ───────────────────────────────────────────────────

function setGenerating(btn: HTMLButtonElement, loading: boolean): void {
  btn.disabled = loading;
  btn.innerHTML = loading
    ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation:spin 1s linear infinite;"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0"/></svg> Генерация...`
    : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="5 3 19 12 5 21 5 3"/></svg> Сгенерировать`;
}

function showOutputLoading(el: HTMLElement, catId: string): void {
  el.classList.remove('has-content');
  el.innerHTML = `<div class="typing-dot"><span></span><span></span><span></span></div>`;
}

function showOutputError(message: string): void {
  const output = document.getElementById('toolOutput');
  if (!output) return;
  output.classList.add('has-content');
  output.innerHTML = `<div style="color:var(--red);font-size:13px;">⚠️ ${escHtml(message)}</div>`;
}

function showOutputResult(el: HTMLElement, toolId: string, resultUrl: string | null): void {
  el.classList.add('has-content');

  if (toolId.includes('image') || toolId.includes('image-editing')) {
    el.innerHTML = resultUrl
      ? `<div style="text-align:center;padding:16px;">
           <img src="${resultUrl}" alt="Результат" style="max-width:100%;border-radius:var(--radius);margin-bottom:12px;"/>
           <div style="display:flex;gap:8px;justify-content:center;">
             <a href="${resultUrl}" download class="btn btn-primary btn-sm">Скачать</a>
             <button class="btn btn-ghost btn-sm" onclick="navigator.clipboard.writeText('${resultUrl}')">Копировать URL</button>
           </div>
         </div>`
      : `<div style="color:var(--accent);">✓ Изображение готово (URL не получен)</div>`;
    return;
  }

  if (toolId.includes('video') || toolId === 'lip-sync') {
    el.innerHTML = resultUrl
      ? `<div style="text-align:center;padding:16px;">
           <video src="${resultUrl}" controls style="max-width:100%;border-radius:var(--radius);margin-bottom:12px;"></video>
           <a href="${resultUrl}" download class="btn btn-primary btn-sm">Скачать MP4</a>
         </div>`
      : `<div style="color:var(--accent);">✓ Видео готово</div>`;
    return;
  }

  if (toolId === 'text-to-music' || toolId.includes('audio')) {
    el.innerHTML = resultUrl
      ? `<div style="padding:16px;">
           <audio src="${resultUrl}" controls style="width:100%;margin-bottom:12px;"></audio>
           <a href="${resultUrl}" download class="btn btn-primary btn-sm">Скачать MP3</a>
         </div>`
      : `<div style="color:var(--accent);">✓ Аудио готово</div>`;
    return;
  }

  el.innerHTML = `<div style="color:var(--accent);">✓ Готово ${resultUrl ? `<a href="${resultUrl}" target="_blank">Открыть</a>` : ''}</div>`;
}

window.handleFileSelect = (input: HTMLInputElement) => {
  const file = input.files?.[0];
  if (!file) return;
  const label = document.getElementById('uploadLabel');
  if (label) {
    label.innerHTML = `<strong>${escHtml(file.name)}</strong><span style="font-size:11px;color:var(--accent);display:block;margin-top:4px;">Файл загружен ✓</span>`;
  }
};

// ── Чат ──────────────────────────────────────────────────────────

function renderChat(): void {
  const main = document.getElementById('aiMain')!;
  main.innerHTML = `
    <div class="tool-topbar">
      <div class="tool-icon-big">💬</div>
      <div>
        <div class="tool-title">Чат</div>
        <div class="tool-subtitle">Диалог с ИИ-ассистентом</div>
      </div>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;" onclick="clearChat()">Очистить</button>
    </div>
    <div class="chat-wrap-inner">
      <div class="chat-feed" id="chatFeed"></div>
      <div class="chat-input-bar">
        <textarea id="chatInput" rows="1"
          placeholder="Напишите сообщение... (Enter — отправить, Shift+Enter — новая строка)"
          onkeydown="handleChatKey(event)" oninput="autoResize(this)"></textarea>
        <button class="chat-send" id="chatSendBtn" onclick="sendChat()" title="Отправить">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>
    </div>`;
  renderChatFeed();
}

function renderChatFeed(): void {
  const feed = document.getElementById('chatFeed');
  if (!feed) return;

  if (state.chatHistory.length === 0) {
    feed.innerHTML = `
      <div class="chat-empty">
        <div class="chat-empty-icon">💬</div>
        <div class="chat-welcome">ИИ-ассистент</div>
        <div class="chat-welcome-sub">Задайте любой вопрос. Я готов помочь с задачами проекта, кодом, текстами и идеями.</div>
        <div class="chat-starters">
          <button class="starter-btn" onclick="startChat('Помоги написать техническое задание')">📋 ТЗ для задачи</button>
          <button class="starter-btn" onclick="startChat('Проверь этот код на ошибки')">🔍 Проверить код</button>
          <button class="starter-btn" onclick="startChat('Напиши краткое описание проекта BAZZAR MARKET')">📝 Описание проекта</button>
          <button class="starter-btn" onclick="startChat('Придумай идеи для улучшения продукта')">💡 Идеи</button>
        </div>
      </div>`;
    return;
  }

  feed.innerHTML = state.chatHistory.map(m => {
    const isUser = m.role === 'user';
    return `<div class="msg ${isUser ? 'user' : 'ai'}">
      <div class="msg-bubble">${escHtml(m.content)}</div>
    </div>`;
  }).join('');
  feed.scrollTop = feed.scrollHeight;
}

window.clearChat = () => {
  state.chatHistory = [];
  renderChatFeed();
};

window.startChat = (text: string) => {
  const input = document.getElementById('chatInput') as HTMLTextAreaElement | null;
  if (input) input.value = text;
  window.sendChat();
};

window.handleChatKey = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    window.sendChat();
  }
};

window.autoResize = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 120) + 'px';
};

window.sendChat = async () => {
  if (state.isChatLoading) return;

  const input   = document.getElementById('chatInput') as HTMLTextAreaElement | null;
  const sendBtn = document.getElementById('chatSendBtn') as HTMLButtonElement | null;
  const text    = input?.value.trim() ?? '';
  if (!text) return;

  if (input)   { input.value = ''; input.style.height = 'auto'; }
  if (sendBtn) sendBtn.disabled = true;

  state.chatHistory.push({ role: 'user', content: text });
  state.isChatLoading = true;
  renderChatFeed();

  // Индикатор набора
  const feed = document.getElementById('chatFeed');
  if (feed) {
    const typing = document.createElement('div');
    typing.className = 'typing-dot';
    typing.id = 'typingIndicator';
    typing.innerHTML = '<span></span><span></span><span></span>';
    feed.appendChild(typing);
    feed.scrollTop = feed.scrollHeight;
  }

  try {
    // Системный контекст
    const messages: KieChatMessage[] = [
      { role: 'system', content: 'Ты — умный ИИ-ассистент для команды проекта BAZZAR. Отвечай на русском языке. Помогай с задачами проекта, кодом, текстами и идеями. Отвечай чётко и по делу.' },
      ...state.chatHistory,
    ];

    // Запрос через backend proxy (API ключ на сервере!)
    const result = await AI.chat({ messages });
    state.chatHistory.push({ role: 'assistant', content: result.content });

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Неизвестная ошибка';
    state.chatHistory.push({ role: 'assistant', content: `⚠️ Ошибка: ${msg}` });
  } finally {
    state.isChatLoading = false;
    document.getElementById('typingIndicator')?.remove();
    if (sendBtn) sendBtn.disabled = false;
    renderChatFeed();
    const inp = document.getElementById('chatInput') as HTMLTextAreaElement | null;
    inp?.focus();
  }
};

// ── Вспомогательные функции ──────────────────────────────────────

function escHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function getDefaultPrompt(id: string): string {
  const defaults: Record<string, string> = {
    'text-to-video':  'Закат над океаном, волны бьются о берег, золотой час',
    'text-to-image':  'Профессиональный портрет, студийное освещение, 4K',
    'text-to-music':  'Спокойная фоновая музыка для работы, без слов, 60 BPM',
    'text-to-speech': 'Введите текст для синтеза речи...',
    'image-editing':  'Убери фон, сделай яркее, добавь тень',
    'video-editing':  'Ускорь в 2 раза, добавь субтитры, сделай cinematic',
  };
  return defaults[id] ?? '';
}

function uploadIcon(accept: string | null): string {
  if (!accept) return '📄';
  if (accept.includes('image')) return '🖼️';
  if (accept.includes('video')) return '🎥';
  if (accept.includes('audio')) return '🎧';
  return '📎';
}

function acceptLabel(accept: string | null): string {
  if (!accept) return '';
  if (accept.includes('image')) return 'JPG, PNG, WEBP до 10 МБ';
  if (accept.includes('video') && accept.includes('audio')) return 'MP4, MOV, MP3, WAV до 50 МБ';
  if (accept.includes('video')) return 'MP4, MOV, AVI до 50 МБ';
  if (accept.includes('audio')) return 'MP3, WAV, OGG до 20 МБ';
  return '';
}

function renderToolOptions(id: string): string {
  const opts: Record<string, string> = {
    'text-to-video':  `<div class="input-group" style="flex:1;min-width:140px;"><label>Длительность (сек)</label><div class="input-wrap"><input type="number" value="5" min="5" max="10" step="5"/></div></div><div class="input-group" style="flex:1;min-width:140px;"><label>Соотношение</label><div class="input-wrap"><select style="background:none;border:none;outline:none;color:var(--text-primary);font-family:inherit;font-size:13px;width:100%;"><option value="16:9">16:9 (Горизонт.)</option><option value="9:16">9:16 (Вертикал.)</option><option value="1:1">1:1 (Квадрат)</option></select></div></div>`,
    'text-to-image':  `<div class="input-group" style="flex:1;min-width:140px;"><label>Ширина</label><div class="input-wrap"><input type="number" value="1024" min="256" max="2048" step="64"/></div></div><div class="input-group" style="flex:1;min-width:140px;"><label>Высота</label><div class="input-wrap"><input type="number" value="1024" min="256" max="2048" step="64"/></div></div>`,
    'text-to-speech': `<div class="input-group" style="flex:1;min-width:140px;"><label>Голос</label><div class="input-wrap"><select style="background:none;border:none;outline:none;color:var(--text-primary);font-family:inherit;font-size:13px;width:100%;"><option value="f">Женский</option><option value="m">Мужской</option></select></div></div>`,
    'text-to-music':  `<div class="input-group" style="flex:1;min-width:140px;"><label>Модель</label><div class="input-wrap"><select style="background:none;border:none;outline:none;color:var(--text-primary);font-family:inherit;font-size:13px;width:100%;"><option>V4_5</option><option>V5</option><option>V4</option></select></div></div><div class="input-group" style="flex:1;min-width:140px;"><label>Вокал</label><div class="input-wrap"><select style="background:none;border:none;outline:none;color:var(--text-primary);font-family:inherit;font-size:13px;width:100%;"><option value="f">Женский</option><option value="m">Мужской</option><option value="">Без вокала</option></select></div></div>`,
  };
  return opts[id] ?? '';
}

// Экспортируем в window для HTML onclick-обработчиков
declare global {
  interface Window {
    toggleCat:        (id: string) => void;
    selectTool:       (toolId: string, catId: string) => void;
    runGenerate:      (toolId: string, catId: string) => void;
    handleFileSelect: (input: HTMLInputElement) => void;
    clearChat:        () => void;
    startChat:        (text: string) => void;
    handleChatKey:    (e: KeyboardEvent) => void;
    autoResize:       (el: HTMLTextAreaElement) => void;
    sendChat:         () => void;
  }
}

// Автозапуск при загрузке DOM
document.addEventListener('DOMContentLoaded', init);
