import React, { forwardRef, useMemo } from 'react';
import { clsx } from '../../../utils/clsx';

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'simple' | 'wave' | 'dots' | 'spinner';
  label?: string;
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
  ({ variant = 'default', label, className, classNames = {}, ...props }, ref) => {
    const baseClass = clsx('inline-flex flex-col items-center justify-center', className);

    const content = useMemo(() => {
      switch (variant) {
        case 'wave':
        case 'dots':
          return (
            <div className={clsx('flex gap-1', classNames.wrapper)}>
              {[...Array(3)].map((_, i) => (
                <i
                  key={i}
                  className={clsx('block w-2 h-2 bg-current rounded-full animate-bounce', classNames.dots)}
                  style={{
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          );

        case 'simple':
          return (
            <svg
              className={clsx('animate-spin text-current', classNames.wrapper)}
              width="24"
              height="24"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className={clsx('opacity-25', classNames.circle1)}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className={clsx('opacity-75', classNames.circle2)}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z"
              />
            </svg>
          );

        case 'spinner':
          return (
            <div className={clsx('relative w-6 h-6', classNames.wrapper)}>
              {[...Array(12)].map((_, i) => (
                <i
                  key={i}
                  className={clsx(
                    'absolute left-1/2 top-1/2 w-0.5 h-1.5 bg-current origin-center opacity-20 animate-pulse',
                    classNames.spinnerBars,
                  )}
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-8px)`,
                    animationDelay: `${i * 0.1}s`,
                  }}
                />
              ))}
            </div>
          );

        default:
          return (
            <div className={clsx('relative w-8 h-8', classNames.wrapper)}>
              <i
                className={clsx(
                  'absolute inset-0 rounded-full border-4 border-current border-opacity-25',
                  classNames.circle1,
                )}
              />
              <i
                className={clsx(
                  'absolute inset-0 rounded-full border-4 border-t-transparent animate-spin',
                  classNames.circle2,
                )}
              />
            </div>
          );
      }
    }, [variant, classNames]);

    return (
      <div ref={ref} className={baseClass} aria-label={label || 'Loading'} {...props}>
        {content}
        {label && <span className={clsx('mt-2 text-sm text-gray-600', classNames.label)}>{label}</span>}
      </div>
    );
  },
);
