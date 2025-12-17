import React, { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import '../styles/index.css';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'simple' | 'wave' | 'dots' | 'spinner';
  label?: string;
  color?: string;
  classNames?: {
    base?: string;
    wrapper?: string;
    dots?: string;
    spinnerBars?: string;
    circle1?: string;
    circle2?: string;
    label?: string;
  };
}

export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  ({ variant = 'default', label, className, classNames = {}, color = 'currentColor', ...props }, ref) => {
    const content = useMemo(() => {
      switch (variant) {
        case 'wave':
        case 'dots':
          return (
            <div className={clsx('spinner-dots-wrapper', classNames.wrapper)}>
              {[0, 1, 2].map((i) => (
                <i
                  key={i}
                  className={clsx('spinner-dot', classNames.dots)}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          );

        case 'simple':
          return (
            <svg
              className={clsx('spinner-simple', classNames.wrapper)}
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color }}
            >
              <circle
                className={clsx('spinner-simple-circle1', classNames.circle1)}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={clsx('spinner-simple-circle2', classNames.circle2)}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
              />
            </svg>
          );

        case 'spinner':
          return (
            <div className={clsx('spinner-bars-wrapper', classNames.wrapper)}>
              {[...Array(12)].map((_, i) => (
                <i
                  key={i}
                  className={clsx('spinner-bar', classNames.spinnerBars)}
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-8px)`,
                    animationDelay: `${i * 0.1}s`,
                    backgroundColor: color,
                  }}
                />
              ))}
            </div>
          );

        default:
          return (
            <div className={clsx('spinner-default', classNames.wrapper)}>
              <i className={clsx('spinner-default-circle1', classNames.circle1)} style={{ borderColor: color }} />
              <i className={clsx('spinner-default-circle2', classNames.circle2)} style={{ borderColor: color }} />
            </div>
          );
      }
    }, [variant, classNames, color]);

    return (
      <div ref={ref} className={clsx('spinner-base', className)} aria-label={label || 'Loading'} {...props}>
        {content}
        {label && <span className={clsx('spinner-label', classNames.label)}>{label}</span>}
      </div>
    );
  },
);
