/**
 * @file Badge.tsx
 * Chip-компонент для статусов и тегов.
 */

import clsx from 'clsx';

type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'purple' | 'muted';
type TagVariant   = 'dev' | 'design' | 'ops' | 'bug' | 'marketing';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

/** Статусный badge */
export function Badge({ variant = 'green', children, className, dot }: BadgeProps) {
  return (
    <span className={clsx('badge', `badge-${variant}`, className)}>
      {dot && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />}
      {children}
    </span>
  );
}

const TAG_LABELS: Record<TagVariant, string> = {
  dev:       'Dev',
  design:    'Design',
  ops:       'Ops',
  bug:       'Баг',
  marketing: 'Маркетинг',
};

interface TaskTagProps {
  tag: TagVariant | string;
}

/** Тег задачи (Dev, Design, Bug…) */
export function TaskTag({ tag }: TaskTagProps) {
  return (
    <span
      className={clsx('badge', 'tag-' + tag)}
      style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4 }}
    >
      {TAG_LABELS[tag as TagVariant] ?? tag}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'paid' | 'pending' | 'cancelled' | 'active' | 'archived';
}

const STATUS_MAP: Record<string, { variant: BadgeVariant; label: string }> = {
  paid:      { variant: 'green',  label: 'Оплачено' },
  pending:   { variant: 'yellow', label: 'Ожидание' },
  cancelled: { variant: 'red',    label: 'Отменено' },
  active:    { variant: 'green',  label: 'Активен' },
  archived:  { variant: 'muted',  label: 'Архив' },
};

/** Статус финансовой записи или проекта */
export function StatusBadge({ status }: StatusBadgeProps) {
  const { variant, label } = STATUS_MAP[status] ?? { variant: 'muted' as BadgeVariant, label: status };
  return <Badge variant={variant} dot>{label}</Badge>;
}
