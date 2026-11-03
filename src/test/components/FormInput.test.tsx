import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Form from '~/components/ui/form';
import FormInput from '~/components/ui/input';

const Schema = z.object({
  name: z.string().trim().min(1, 'Name the stop'),
  minutes: z.number('Enter minutes').min(0, 'Can’t be negative'),
});
type Values = z.infer<typeof Schema>;

const TestForm = ({ onSubmit }: { onSubmit: (values: Values) => void }) => {
  const methods = useForm<Values>({
    defaultValues: { name: '', minutes: Number.NaN },
    resolver: zodResolver(Schema),
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <FormInput name="name" label="Stop name" />
      <FormInput name="minutes" label="Minute" type="number" valueAsNumber />
      <button type="submit">Save</button>
    </Form>
  );
};

describe('FormInput', () => {
  it('shows zod errors and marks the inputs invalid', async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(await screen.findByText('Name the stop')).toBeInTheDocument();
    expect(screen.getByText('Enter minutes')).toBeInTheDocument();
    expect(screen.getByLabelText('Stop name')).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits typed values, with numbers as numbers', async () => {
    const onSubmit = vi.fn();
    render(<TestForm onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText('Stop name'), 'UTP Main Gate');
    await userEvent.type(screen.getByLabelText('Minute'), '12');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSubmit).toHaveBeenCalledWith(
      { name: 'UTP Main Gate', minutes: 12 },
      expect.anything(),
    );
  });
});
