/**
 * @file Sidebar.tsx
 * Боковая навигационная панель.
 * Использует NavLink из React Router для активного состояния.
 */

import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home, MessageSquare, Users, CheckSquare, DollarSign,
  BarChart2, Settings, Sparkles, LogOut,
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  id:    string;
  label: string;
  href:  string;
  badge?: number;
  icon:  React.ReactNode;
}

interface NavSection {
  section: string;
  items:   NavItem[];
}

const NAV: NavSection[] = [
  {
    section: 'Рабочее пространство',
    items: [
      { id: 'home',     label: 'Главная',    href: '/home',     icon: <Home size={16} /> },
      { id: 'messages', label: 'Сообщения',  href: '/messages', badge: 3, icon: <MessageSquare size={16} /> },
    ],
  },
  {
    section: 'Команда',
    items: [
      { id: 'employees', label: 'Сотрудники', href: '/employees', badge: 10, icon: <Users size={16} /> },
      { id: 'tasks',     label: 'Задачи',     href: '/tasks',     badge: 7,  icon: <CheckSquare size={16} /> },
    ],
  },
  {
    section: 'Финансы',
    items: [
      { id: 'finance',   label: 'Финансы',   href: '/finance',   icon: <DollarSign size={16} /> },
      { id: 'analytics', label: 'Аналитика', href: '/analytics', icon: <BarChart2 size={16} /> },
    ],
  },
  {
    section: 'Система',
    items: [
      { id: 'settings', label: 'Настройки', href: '/settings', icon: <Settings size={16} /> },
    ],
  },
];

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      {/* Бренд */}
      <div className="sidebar-brand">
        <div className="dot" />
        BAZZAR
      </div>

      {/* Навигация */}
      {NAV.map(group => (
        <div className="nav-section" key={group.section}>
          <div className="nav-section-label">{group.section}</div>

          {group.items.map(item => (
            <NavLink
              key={item.id}
              to={item.href}
              className={({ isActive }) =>
                clsx('nav-item', isActive && 'active')
              }
            >
              {item.icon}
              {item.label}
              {item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          ))}
        </div>
      ))}

      {/* ИИ инструменты — выделен отдельно */}
      <div className="nav-section">
        <div className="nav-section-label">ИИ</div>
        <NavLink
          to="/ai-tools"
          className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          style={{ color: 'var(--accent)', opacity: 0.9 }}
        >
          <Sparkles size={16} />
          ИИ редактор
        </NavLink>
      </div>

      {/* Пользователь */}
      <div className="sidebar-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            className="avatar"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: 11 }}
          >
            АК
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Артём К.</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Администратор</div>
          </div>
          <button
            className="btn-icon"
            title="Выйти"
            onClick={() => navigate('/login')}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>
    </aside>
  );
}
