import * as React from 'react';
import { clsx } from '@lib/utils/clsx';
import '../styles/index.css';

type SwitchSize = 'sm' | 'md' | 'lg';

export type SwitchProps = {
  'checked'?: boolean;
  'defaultChecked'?: boolean;
  'onCheckedChange'?: (checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => void;

  'disabled'?: boolean;
  'required'?: boolean;
  'name'?: string;
  'value'?: string;
  'id'?: string;

  'label'?: React.ReactNode;
  'description'?: React.ReactNode;

  'size'?: SwitchSize;

  'className'?: string;
  'trackClassName'?: string;
  'thumbClassName'?: string;
  'labelClassName'?: string;

  'startContent'?: React.ReactNode;
  'endContent'?: React.ReactNode;

  'thumb'?: (ctx: { checked: boolean; disabled: boolean; size: SwitchSize }) => React.ReactNode;

  'aria-label'?: string;
  'aria-labelledby'?: string;
};

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  {
    checked,
    defaultChecked,
    onCheckedChange,
    disabled = false,
    required = false,
    name,
    value,
    id,
    label,
    description,
    size = 'md',
    className,
    trackClassName,
    thumbClassName,
    labelClassName,
    startContent,
    endContent,
    thumb,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
  },
  ref,
) {
  const isControlled = typeof checked === 'boolean';
  const [uncontrolled, setUncontrolled] = React.useState(!!defaultChecked);
  const isChecked = isControlled ? !!checked : uncontrolled;

  const inputId = id ?? React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.checked;
    if (!isControlled) setUncontrolled(next);
    onCheckedChange?.(next, e);
  };

  const renderedThumb = thumb?.({ checked: isChecked, disabled, size }) ?? (isChecked ? endContent : startContent);

  return (
    <label
      className={clsx('autoui-switch', `autoui-switch--${size}`, disabled && 'is-disabled', className)}
      htmlFor={inputId}
    >
      <span className={clsx('autoui-switch__control', trackClassName)} aria-hidden="true">
        <input
          ref={ref}
          id={inputId}
          className="autoui-switch__input"
          type="checkbox"
          checked={isChecked}
          defaultChecked={defaultChecked}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          name={name}
          value={value}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledby}
        />

        <span className={clsx('autoui-switch__track')} />
        <span className={clsx('autoui-switch__thumb', thumbClassName)}>
          {renderedThumb ? <span className="autoui-switch__thumbContent">{renderedThumb}</span> : null}
        </span>
      </span>

      {(label || description) && (
        <span className={clsx('autoui-switch__text', labelClassName)}>
          {label && <span className="autoui-switch__label">{label}</span>}
          {description && <span className="autoui-switch__description">{description}</span>}
        </span>
      )}
    </label>
  );
});
