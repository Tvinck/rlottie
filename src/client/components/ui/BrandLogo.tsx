/**
 * @file BrandLogo.tsx
 * Голографический логотип BAZZAR — буква B с вращающимся conic-gradient
 * по периметру и градиентной заливкой буквы. Совместим со всеми браузерами.
 */

import clsx from 'clsx';

interface BrandLogoProps {
  size?:      number;
  animated?:  boolean;
  className?: string;
}

export function BrandLogo({ size = 56, animated = true, className }: BrandLogoProps) {
  const radius = Math.round(size * 0.26);

  return (
    <div
      className={clsx('brand-logo', className)}
      style={{ width: size, height: size, borderRadius: radius }}
    >
      <div
        className={clsx('brand-logo-ring', animated && 'brand-logo-ring-spin')}
        style={{ borderRadius: radius }}
      />
      <div
        className="brand-logo-inner"
        style={{ borderRadius: radius - 2 }}
      >
        <span className="brand-logo-letter" style={{ fontSize: Math.round(size * 0.48) }}>
          B
        </span>
      </div>
    </div>
  );
}
