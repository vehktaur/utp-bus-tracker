import type { ComponentProps } from 'react';
import { FormProvider } from 'react-hook-form';
import type {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  UseFormReturn,
} from 'react-hook-form';

type FormProps<
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
> = Omit<ComponentProps<'form'>, 'onSubmit'> & {
  methods: UseFormReturn<TFieldValues, TContext, TTransformedValues>;
  onSubmit: SubmitHandler<TTransformedValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
};

const Form = <
  TFieldValues extends FieldValues,
  TContext = unknown,
  TTransformedValues = TFieldValues,
>({
  methods,
  onSubmit,
  onInvalid,
  children,
  ...formProps
}: FormProps<TFieldValues, TContext, TTransformedValues>) => {
  return (
    <FormProvider {...methods}>
      <form
        noValidate
        onSubmit={methods.handleSubmit(onSubmit, onInvalid)}
        {...formProps}
      >
        {children}
      </form>
    </FormProvider>
  );
};

export default Form;
