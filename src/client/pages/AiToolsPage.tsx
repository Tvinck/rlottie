import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, Download, Wand2, Video, Music, MessageSquare, RefreshCw } from 'lucide-react';
import { useGenerateImage, useGenerateVideo, useGenerateMusic, useAiChat, useAiJob } from '../hooks/useAiJob';
import { Spinner, TypingDots } from '../components/ui/Spinner';
import type { KieChatMessage } from '../../../shared/types';

// ── Image tool ──────────────────────────────────────────────────────

function ImageTool() {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId]   = useState<string | null>(null);
  const [width, setWidth]   = useState(1024);
  const [height, setHeight] = useState(1024);
  const generate            = useGenerateImage();
  const { data: job }       = useAiJob(jobId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generate.mutateAsync({ prompt, width, height });
    setJobId(result.id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: '100%' }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Генерация изображения</h3>
        <form onSubmit={handleGenerate}>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Промпт *</label>
            <textarea
              className="form-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="A futuristic city at night with neon lights, cyberpunk style..."
              style={{ resize: 'vertical' }}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="form-label">Ширина (px)</label>
              <select className="form-input" value={width} onChange={(e) => setWidth(Number(e.target.value))}>
                <option value={512}>512</option>
                <option value={768}>768</option>
                <option value={1024}>1024</option>
                <option value={1280}>1280</option>
              </select>
            </div>
            <div>
              <label className="form-label">Высота (px)</label>
              <select className="form-input" value={height} onChange={(e) => setHeight(Number(e.target.value))}>
                <option value={512}>512</option>
                <option value={768}>768</option>
                <option value={1024}>1024</option>
                <option value={1280}>1280</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={generate.isPending} style={{ width: '100%' }}>
            {generate.isPending ? <><Spinner size={14} /> Запускаю...</> : <><Wand2 size={14} /> Сгенерировать</>}
          </button>
        </form>

        {jobId && (
          <div style={{ marginTop: 16 }}>
            <JobStatus jobId={jobId} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {job?.status === 'success' && job.result_url ? (
          <div style={{ textAlign: 'center' }}>
            <img
              src={job.result_url}
              alt="AI generated"
              style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 12, border: '1px solid var(--border)' }}
            />
            <div style={{ marginTop: 12 }}>
              <a href={job.result_url} download className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
                <Download size={14} /> Скачать
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Wand2 size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Результат появится здесь</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Video tool ──────────────────────────────────────────────────────

function VideoTool() {
  const [prompt, setPrompt]   = useState('');
  const [jobId, setJobId]     = useState<string | null>(null);
  const [duration, setDuration] = useState<5 | 10>(5);
  const [ratio, setRatio]     = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const generate              = useGenerateVideo();
  const { data: job }         = useAiJob(jobId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await generate.mutateAsync({ prompt, duration, ratio });
    setJobId(result.id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, height: '100%' }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Генерация видео (Kling AI)</h3>
        <form onSubmit={handleGenerate}>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Промпт *</label>
            <textarea
              className="form-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              placeholder="A drone shot of mountain landscape at sunset..."
              style={{ resize: 'vertical' }}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label className="form-label">Длительность</label>
              <select className="form-input" value={duration} onChange={(e) => setDuration(Number(e.target.value) as 5 | 10)}>
                <option value={5}>5 сек</option>
                <option value={10}>10 сек</option>
              </select>
            </div>
            <div>
              <label className="form-label">Соотношение сторон</label>
              <select className="form-input" value={ratio} onChange={(e) => setRatio(e.target.value as '16:9' | '9:16' | '1:1')}>
                <option value="16:9">16:9 (горизонталь)</option>
                <option value="9:16">9:16 (вертикаль)</option>
                <option value="1:1">1:1 (квадрат)</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" type="submit" disabled={generate.isPending} style={{ width: '100%' }}>
            {generate.isPending ? <><Spinner size={14} /> Запускаю...</> : <><Video size={14} /> Сгенерировать</>}
          </button>
        </form>

        {jobId && (
          <div style={{ marginTop: 16 }}>
            <JobStatus jobId={jobId} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {job?.status === 'success' && job.result_url ? (
          <div style={{ textAlign: 'center' }}>
            <video
              src={job.result_url}
              controls
              style={{ maxWidth: '100%', maxHeight: 350, borderRadius: 12, border: '1px solid var(--border)' }}
            />
            <div style={{ marginTop: 12 }}>
              <a href={job.result_url} download className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
                <Download size={14} /> Скачать
              </a>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Video size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Результат появится здесь</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Music tool ──────────────────────────────────────────────────────

function MusicTool() {
  const [prompt, setPrompt]   = useState('');
  const [style, setStyle]     = useState('');
  const [jobId, setJobId]     = useState<string | null>(null);
  const [instrumental, setInstrumental] = useState(false);
  const generate              = useGenerateMusic();
  const { data: job }         = useAiJob(jobId);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const musicReq: Parameters<typeof generate.mutateAsync>[0] = { prompt, instrumental, model: 'V5' };
    if (style) musicReq.style = style;
    const result = await generate.mutateAsync(musicReq);
    setJobId(result.id);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Генерация музыки (Suno V5)</h3>
        <form onSubmit={handleGenerate}>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Описание музыки *</label>
            <textarea
              className="form-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              placeholder="Energetic electronic music with heavy bass for a product launch video..."
              style={{ resize: 'vertical' }}
              required
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label className="form-label">Стиль (опционально)</label>
            <input
              className="form-input"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              placeholder="electronic, hip-hop, cinematic..."
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input
              type="checkbox"
              id="instrumental"
              checked={instrumental}
              onChange={(e) => setInstrumental(e.target.checked)}
            />
            <label htmlFor="instrumental" style={{ fontSize: 13, cursor: 'pointer' }}>
              Инструментальная (без вокала)
            </label>
          </div>
          <button className="btn btn-primary" type="submit" disabled={generate.isPending} style={{ width: '100%' }}>
            {generate.isPending ? <><Spinner size={14} /> Запускаю...</> : <><Music size={14} /> Сгенерировать</>}
          </button>
        </form>

        {jobId && (
          <div style={{ marginTop: 16 }}>
            <JobStatus jobId={jobId} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {job?.status === 'success' && job.result_url ? (
          <div style={{ textAlign: 'center', width: '100%' }}>
            <audio
              src={job.result_url}
              controls
              style={{ width: '100%', marginBottom: 12 }}
            />
            <a href={job.result_url} download className="btn btn-ghost btn-sm" target="_blank" rel="noreferrer">
              <Download size={14} /> Скачать
            </a>
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
            <Music size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Результат появится здесь</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat tool ───────────────────────────────────────────────────────

function ChatTool() {
  const [messages, setMessages]   = useState<KieChatMessage[]>([]);
  const [input, setInput]         = useState('');
  const chat                      = useAiChat();
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chat.isPending]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg: KieChatMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    try {
      const result = await chat.mutateAsync({ messages: updatedMessages });
      setMessages([...updatedMessages, { role: 'assistant', content: result.content }]);
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', content: '⚠️ Ошибка при получении ответа. Попробуйте ещё раз.' }]);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, flexShrink: 0 }}>ИИ Ассистент</h3>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16, paddingRight: 4 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: 40 }}>
            <MessageSquare size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
            <div style={{ fontSize: 13 }}>Задайте вопрос ИИ ассистенту</div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  maxWidth: '75%', padding: '10px 14px', borderRadius: 12,
                  fontSize: 13, lineHeight: 1.6,
                  background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg-card2)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  borderBottomRightRadius: msg.role === 'user' ? 4 : 12,
                  borderBottomLeftRadius:  msg.role === 'assistant' ? 4 : 12,
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {chat.isPending && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <TypingDots />
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <input
          className="form-input"
          style={{ flex: 1 }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спросите что-нибудь..."
          disabled={chat.isPending}
        />
        <button className="btn btn-primary" type="submit" disabled={chat.isPending || !input.trim()}>
          {chat.isPending ? <Spinner size={14} /> : <Send size={14} />}
        </button>
        {messages.length > 0 && (
          <button className="btn btn-ghost" type="button" title="Очистить" onClick={() => setMessages([])}>
            <RefreshCw size={14} />
          </button>
        )}
      </form>
    </div>
  );
}

// ── Job status badge ────────────────────────────────────────────────

function JobStatus({ jobId }: { jobId: string }) {
  const { data: job } = useAiJob(jobId);

  if (!job) return null;

  const statusConfig: Record<string, { label: string; color: string }> = {
    queued:     { label: 'В очереди...',   color: 'var(--text-muted)' },
    processing: { label: 'Генерируется...', color: 'var(--accent)' },
    success:    { label: 'Готово!',        color: 'var(--green)' },
    failed:     { label: 'Ошибка',         color: 'var(--red, #f87171)' },
  };

  const cfg = statusConfig[job.status] ?? { label: job.status, color: 'var(--text-muted)' };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: cfg.color }}>
      {(job.status === 'queued' || job.status === 'processing') && <Spinner size={12} />}
      {cfg.label}
      {job.error && <span style={{ color: 'var(--red, #f87171)' }}> — {job.error}</span>}
    </div>
  );
}

// ── Main page ───────────────────────────────────────────────────────

const TOOLS = [
  { id: 'image', label: 'Изображения', icon: <Wand2 size={16} /> },
  { id: 'video', label: 'Видео',       icon: <Video size={16} /> },
  { id: 'music', label: 'Музыка',      icon: <Music size={16} /> },
  { id: 'chat',  label: 'Чат',         icon: <MessageSquare size={16} /> },
];

export default function AiToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTool = searchParams.get('tool') ?? 'image';

  const setTool = (id: string) => setSearchParams({ tool: id });

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 32px)', gap: 0 }}>
      {/* Left sidebar */}
      <div style={{
        width: 180, flexShrink: 0,
        borderRight: '1px solid var(--border)',
        padding: '20px 12px',
      }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, paddingLeft: 8 }}>
          ИИ Инструменты
        </div>
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setTool(tool.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 6, border: 'none',
              background: activeTool === tool.id ? 'var(--bg-card2)' : 'transparent',
              color: activeTool === tool.id ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', fontWeight: activeTool === tool.id ? 600 : 400,
              marginBottom: 2,
            }}
          >
            {tool.icon}
            {tool.label}
          </button>
        ))}
      </div>

      {/* Tool panel */}
      <div style={{ flex: 1, padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTool === 'image' && <ImageTool />}
        {activeTool === 'video' && <VideoTool />}
        {activeTool === 'music' && <MusicTool />}
        {activeTool === 'chat'  && <ChatTool />}
      </div>
    </div>
  );
}
