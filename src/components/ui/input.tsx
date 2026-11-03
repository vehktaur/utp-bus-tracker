import { useId } from 'react';
import { Controller, get, useFormState } from 'react-hook-form';
import type { InputProps } from '~/types';
import { cn } from '~/utils';
import FormErrorMessage from './error-message';

/** Presentational input. Use `FormInput` inside a form */
const Input = ({
  id: _id,
  label,
  className,
  classNames,
  prefix,
  suffix,
  size = 'md',
  error,
  errorEl,
  ...props
}: InputProps) => {
  const generatedId = useId();
  const id = _id ?? generatedId;

  return (
    <div className={cn('w-full', classNames?.root)}>
      {label && (
        <label className={cn('label', classNames?.label)} htmlFor={id}>
          {label}
        </label>
      )}

      <div className="relative flex w-full">
        {prefix && (
          <span
            className={cn(
              'text-muted-foreground absolute top-0 left-3 h-full content-center',
              { 'text-destructive': error },
            )}
          >
            {prefix}
          </span>
        )}

        <input
          id={id}
          aria-invalid={error || undefined}
          className={cn(
            'bg-card text-foreground placeholder:text-muted-foreground outline-input focus-visible:outline-primary w-full rounded-xl outline transition-[outline-color] duration-300 focus-visible:outline-2',
            {
              'outline-destructive': error,
              'ps-9': prefix,
              'pe-9': suffix,
              'clamp-[px,3,3.5] clamp-[text,2xs,xs] py-1.5': size === 'sm',
              'clamp-[px,3,3.5] clamp-[py,2,2.5] clamp-[text,xs,2sm]':
                size === 'md',
              'clamp-[px,3.5,4] clamp-[py,2.5,3] clamp-[text,sm,base]':
                size === 'lg',
            },
            classNames?.input,
            className,
          )}
          {...props}
        />

        {suffix && (
          <span className="text-muted-foreground absolute top-0 right-3 h-full content-center">
            {suffix}
          </span>
        )}
      </div>

      {errorEl}
    </div>
  );
};

/** Input wired to react-hook-form through context */
const FormInput = ({
  name,
  size,
  valueAsNumber,
  ...props
}: Omit<InputProps, 'error' | 'errorEl'> & {
  name: string;
  valueAsNumber?: boolean;
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const { errors } = useFormState({ name });

  return (
    <Controller
      name={name}
      render={({ field: { value, onChange, ...field } }) => (
        <Input
          id={id}
          aria-describedby={errorId}
          error={!!get(errors, name)}
          errorEl={<FormErrorMessage name={name} id={errorId} size={size} />}
          value={Number.isNaN(value) ? '' : (value ?? '')}
          onChange={({ target }) =>
            onChange(valueAsNumber ? target.valueAsNumber : target.value)
          }
          {...field}
          {...props}
          size={size}
        />
      )}
    />
  );
};

export { FormInput, Input };
export default FormInput;
