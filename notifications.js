// ─── NOTIFICATIONS PANEL ────────────────────────────────────────────────────

const NOTIF_DATA = [
  {id:1, type:'task',    read:false, title:'Новая задача назначена',     body:'«Интеграция платёжки» — BAZZAR MARKET',       time:'5 мин назад',  icon:'task'},
  {id:2, type:'message', read:false, title:'Новое сообщение',            body:'Алексей Ким: «Жди, уточняю детали по деплою»', time:'12 мин назад', icon:'msg'},
  {id:3, type:'finance', read:false, title:'Счёт ожидает выплаты',       body:'# 404-002 · ТехСтарт · ₽ 80 770',             time:'1 час назад',  icon:'money'},
  {id:4, type:'task',    read:false, title:'Задача завершена',            body:'Мария Смирнова закрыла «Авторизация OAuth»',   time:'2 часа назад', icon:'task'},
  {id:5, type:'message', read:true,  title:'Упоминание в канале',         body:'Иван Петров упомянул вас в #разработка',       time:'3 часа назад', icon:'msg'},
  {id:6, type:'system',  read:true,  title:'Новый сотрудник',             body:'Сергей Волков добавлен в PIXEL',               time:'вчера',        icon:'user'},
  {id:7, type:'finance', read:true,  title:'Зарплата выплачена',          body:'Мария Смирнова · ₽ 97 000',                   time:'вчера',        icon:'money'},
  {id:8, type:'task',    read:true,  title:'Дедлайн через 2 дня',        body:'«Корзина и оформление заказа» — BAZZAR MARKET', time:'вчера',       icon:'task'},
  {id:9, type:'system',  read:true,  title:'Обновление системы',          body:'Портал BAZZAR обновлён до версии 2.2.0',       time:'2 дня назад',  icon:'system'},
];

let notifState = JSON.parse(localStorage.getItem('bazzar_notifs') || 'null') || NOTIF_DATA.map(n=>({...n}));

function saveNotifState() {
  localStorage.setItem('bazzar_notifs', JSON.stringify(notifState));
}

function getUnreadCount() {
  return notifState.filter(n=>!n.read).length;
}

const NOTIF_ICONS = {
  task:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
  msg:    `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
  money:  `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  user:   `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
  system: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
};

const NOTIF_COLORS = {
  task:   { bg:'rgba(170,255,71,.12)',   color:'var(--accent)' },
  message:{ bg:'rgba(71,200,255,.12)',   color:'#47C8FF' },
  finance:{ bg:'rgba(255,209,102,.12)',  color:'var(--yellow)' },
  system: { bg:'rgba(255,255,255,.07)',  color:'var(--text-muted)' },
};

function initNotifications() {
  // Inject styles
  if (!document.getElementById('notif-styles')) {
    const style = document.createElement('style');
    style.id = 'notif-styles';
    style.textContent = `
      .notif-overlay {
        position: fixed; inset: 0; background: rgba(0,0,0,.45);
        z-index: 998; opacity: 0; pointer-events: none;
        transition: opacity .25s;
      }
      .notif-overlay.open { opacity: 1; pointer-events: all; }
      .notif-panel {
        position: fixed; top: 0; right: 0; bottom: 0;
        width: 360px; background: var(--bg-secondary);
        border-left: 1px solid var(--border);
        z-index: 999; display: flex; flex-direction: column;
        transform: translateX(100%); transition: transform .28s cubic-bezier(.4,0,.2,1);
        box-shadow: -8px 0 40px rgba(0,0,0,.4);
      }
      .notif-panel.open { transform: translateX(0); }
      .notif-panel-head {
        display: flex; align-items: center; justify-content: space-between;
        padding: 18px 18px 14px; border-bottom: 1px solid var(--border);
        flex-shrink: 0;
      }
      .notif-panel-title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 8px; }
      .notif-badge-count {
        font-size: 11px; font-weight: 700; background: var(--accent); color: #0B0B14;
        padding: 2px 7px; border-radius: 10px;
      }
      .notif-actions { display: flex; gap: 6px; }
      .notif-action-btn {
        font-size: 11px; color: var(--text-muted); background: none; border: none;
        cursor: pointer; padding: 4px 8px; border-radius: 5px; font-family: inherit;
        transition: all .15s;
      }
      .notif-action-btn:hover { color: var(--accent); background: var(--accent-dim); }
      .notif-filter-row {
        display: flex; gap: 4px; padding: 10px 18px;
        border-bottom: 1px solid var(--border); flex-shrink: 0; overflow-x: auto;
      }
      .notif-filter-btn {
        font-size: 11px; font-weight: 600; padding: 5px 12px; border-radius: 20px;
        border: 1px solid var(--border); background: transparent; color: var(--text-muted);
        cursor: pointer; white-space: nowrap; font-family: inherit; transition: all .15s;
      }
      .notif-filter-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
      .notif-list { flex: 1; overflow-y: auto; padding: 8px 0; }
      .notif-item {
        display: flex; align-items: flex-start; gap: 12px;
        padding: 12px 18px; cursor: pointer; transition: background .15s;
        border-bottom: 1px solid rgba(255,255,255,.03); position: relative;
      }
      .notif-item:last-child { border-bottom: none; }
      .notif-item:hover { background: rgba(255,255,255,.03); }
      .notif-item.unread { background: rgba(170,255,71,.03); }
      .notif-item.unread::before {
        content: ''; position: absolute; left: 6px; top: 50%; transform: translateY(-50%);
        width: 5px; height: 5px; border-radius: 50%; background: var(--accent);
      }
      .notif-icon {
        width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
      }
      .notif-body { flex: 1; min-width: 0; }
      .notif-title { font-size: 12px; font-weight: 600; margin-bottom: 3px; }
      .notif-text  { font-size: 11px; color: var(--text-muted); line-height: 1.4; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .notif-time  { font-size: 10px; color: var(--text-muted); opacity: .7; }
      .notif-dismiss {
        width: 20px; height: 20px; border-radius: 4px; background: none; border: none;
        color: var(--text-muted); cursor: pointer; display: flex; align-items: center;
        justify-content: center; opacity: 0; transition: all .15s; flex-shrink: 0;
      }
      .notif-item:hover .notif-dismiss { opacity: 1; }
      .notif-dismiss:hover { background: rgba(255,90,90,.15); color: var(--red); }
      .notif-empty { padding: 48px 24px; text-align: center; }
      .notif-empty-icon { width: 52px; height: 52px; border-radius: 50%; background: var(--bg-card2); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
      .notif-empty-text { font-size: 14px; font-weight: 600; margin-bottom: 4px; }
      .notif-empty-sub  { font-size: 12px; color: var(--text-muted); }
    `;
    document.head.appendChild(style);
  }

  // Inject HTML
  if (!document.getElementById('notif-panel')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="notif-overlay" id="notif-overlay" onclick="closeNotifications()"></div>
      <div class="notif-panel" id="notif-panel">
        <div class="notif-panel-head">
          <div class="notif-panel-title">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            Уведомления
            <span class="notif-badge-count" id="notif-head-count"></span>
          </div>
          <div class="notif-actions">
            <button class="notif-action-btn" onclick="markAllRead()">Прочитать все</button>
            <button class="notif-action-btn" onclick="clearAll()">Очистить</button>
            <button class="notif-action-btn" style="padding:4px;" onclick="closeNotifications()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
        <div class="notif-filter-row">
          <button class="notif-filter-btn active" onclick="filterNotifs('all',this)">Все</button>
          <button class="notif-filter-btn" onclick="filterNotifs('task',this)">Задачи</button>
          <button class="notif-filter-btn" onclick="filterNotifs('message',this)">Сообщения</button>
          <button class="notif-filter-btn" onclick="filterNotifs('finance',this)">Финансы</button>
          <button class="notif-filter-btn" onclick="filterNotifs('system',this)">Система</button>
        </div>
        <div class="notif-list" id="notif-list"></div>
      </div>
    `);
  }

  renderNotifications('all');
  updateBellBadge();
}

let currentNotifFilter = 'all';

function renderNotifications(filter) {
  currentNotifFilter = filter;
  const list = document.getElementById('notif-list');
  const filtered = filter === 'all' ? notifState : notifState.filter(n => n.type === filter || (filter === 'message' && n.type === 'message'));
  const headCount = document.getElementById('notif-head-count');
  const unread = notifState.filter(n=>!n.read).length;
  if (headCount) headCount.textContent = unread > 0 ? unread : '';
  if (headCount) headCount.style.display = unread > 0 ? '' : 'none';

  if (!filtered.length) {
    list.innerHTML = `<div class="notif-empty">
      <div class="notif-empty-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg></div>
      <div class="notif-empty-text">Нет уведомлений</div>
      <div class="notif-empty-sub">Новые уведомления появятся здесь</div>
    </div>`;
    return;
  }

  list.innerHTML = filtered.map(n => {
    const scheme = NOTIF_COLORS[n.type] || NOTIF_COLORS.system;
    return `
      <div class="notif-item ${n.read?'':'unread'}" onclick="readNotif(${n.id})">
        <div class="notif-icon" style="background:${scheme.bg};color:${scheme.color};">${NOTIF_ICONS[n.icon]||NOTIF_ICONS.system}</div>
        <div class="notif-body">
          <div class="notif-title">${n.title}</div>
          <div class="notif-text">${n.body}</div>
          <div class="notif-time">${n.time}</div>
        </div>
        <button class="notif-dismiss" onclick="dismissNotif(event,${n.id})" title="Удалить">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
  }).join('');
}

function openNotifications() {
  document.getElementById('notif-panel').classList.add('open');
  document.getElementById('notif-overlay').classList.add('open');
}

function closeNotifications() {
  document.getElementById('notif-panel').classList.remove('open');
  document.getElementById('notif-overlay').classList.remove('open');
}

function filterNotifs(type, btn) {
  document.querySelectorAll('.notif-filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderNotifications(type);
}

function readNotif(id) {
  const n = notifState.find(n=>n.id===id);
  if (n) { n.read = true; saveNotifState(); }
  renderNotifications(currentNotifFilter);
  updateBellBadge();
}

function dismissNotif(e, id) {
  e.stopPropagation();
  notifState = notifState.filter(n=>n.id!==id);
  saveNotifState();
  renderNotifications(currentNotifFilter);
  updateBellBadge();
}

function markAllRead() {
  notifState.forEach(n=>n.read=true);
  saveNotifState();
  renderNotifications(currentNotifFilter);
  updateBellBadge();
}

function clearAll() {
  notifState = [];
  saveNotifState();
  renderNotifications(currentNotifFilter);
  updateBellBadge();
}

function updateBellBadge() {
  const count = getUnreadCount();
  document.querySelectorAll('.notif-bell-badge').forEach(el => {
    el.style.display = count > 0 ? '' : 'none';
    el.textContent = count > 9 ? '9+' : (count || '');
  });
}
