import { AnimatePresence, motion } from 'motion/react';
import { get, useFormState } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import type { Size } from '~/types';
import { cn } from '~/utils';

const FormErrorMessage = ({
  name,
  id,
  size = 'md',
  className,
}: {
  name: string;
  id: string;
  size?: Size;
  className?: string;
}) => {
  const { errors } = useFormState({ name });
  const error: FieldError | undefined = get(errors, name);

  return (
    <AnimatePresence>
      {error?.message && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          id={id}
          role="alert"
          className={cn(
            'text-destructive mt-1',
            {
              'text-xxs': size === 'sm',
              'text-xs': size === 'md',
              'text-sm': size === 'lg',
            },
            className,
          )}
        >
          {error.message}
        </motion.p>
      )}
    </AnimatePresence>
  );
};

export default FormErrorMessage;
