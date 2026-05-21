function renderNav(activePage) {
  const nav = [
    {
      section: 'Главное',
      items: [
        { id: 'home', label: 'Главная', href: 'home.html', badge: null, icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>` },
        { id: 'employees', label: 'Сотрудники', href: 'employees.html', badge: 24, icon: `<circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>` },
        { id: 'tasks', label: 'Задачи', href: 'tasks.html', badge: 7, icon: `<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>` },
        { id: 'messages', label: 'Сообщения', href: 'messages.html', badge: 3, icon: `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` },
      ]
    },
    {
      section: 'Финансы',
      items: [
        { id: 'salaries', label: 'Зарплаты', href: 'salaries.html', badge: null, icon: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>` },
        { id: 'invoices', label: 'Счета', href: 'invoices.html', badge: null, icon: `<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>` },
        { id: 'analytics', label: 'Аналитика', href: 'analytics.html', badge: null, icon: `<path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>` },
      ]
    },
    {
      section: 'Система',
      items: [
        { id: 'settings', label: 'Настройки', href: 'settings.html', badge: null, icon: `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>` },
      ]
    }
  ];

  const sectionsHTML = nav.map(group => `
    <div class="nav-section">
      <div class="nav-section-label">${group.section}</div>
      ${group.items.map(item => `
        <a class="nav-item ${activePage === item.id ? 'active' : ''}" href="${item.href}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${item.icon}</svg>
          ${item.label}
          ${item.badge ? `<span class="nav-badge">${item.badge}</span>` : ''}
        </a>
      `).join('')}
    </div>
  `).join('');

  return `
    <div class="sidebar-brand">
      <div class="dot"></div>
      BAZZAR
    </div>
    ${sectionsHTML}
    <div class="sidebar-bottom">
      <div class="user-row">
        <div class="avatar" style="background:var(--accent-dim);color:var(--accent);">АК</div>
        <div class="info">
          <div class="name">Артём К.</div>
          <div class="role">Администратор</div>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="2" style="cursor:pointer;flex-shrink:0;" onclick="window.location.href='index.html'" title="Выйти">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </div>
    </div>
  `;
}

function initNav(activePage) {
  const sidebar = document.querySelector('.sidebar');
  if (sidebar) sidebar.innerHTML = renderNav(activePage);
}
