import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFormState } from 'react-hook-form';
import { Button } from '~/components/ui/button';
import Form from '~/components/ui/form';
import FormInput from '~/components/ui/input';
import { FormSelect } from '~/components/ui/select';
import type { BusRoute } from '~/types';
import {
  BusRouteSchema,
  toBusRouteValues,
} from '~/utils/schemas/busRouteSchema';
import type { BusRouteValues } from '~/utils/schemas/busRouteSchema';
import DeparturesField from './DeparturesField';
import FormSection from './FormSection';
import StopsField from './StopsField';

const DIRECTION_OPTIONS = [
  { label: 'To campus', value: 'to-campus' },
  { label: 'From campus', value: 'from-campus' },
];

export default function RouteForm({
  route,
  onSubmit,
  isSaving,
}: {
  route: BusRoute;
  onSubmit: (values: BusRouteValues) => void;
  isSaving: boolean;
}) {
  const methods = useForm<BusRouteValues>({
    defaultValues: toBusRouteValues(route),
    resolver: zodResolver(BusRouteSchema),
  });
  const { isDirty } = useFormState({ control: methods.control });

  return (
    <Form methods={methods} onSubmit={onSubmit} className="grid gap-5">
      <FormSection
        title="Details"
        description="How the route shows up for riders."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput name="name" label="Route name" />
          <FormSelect
            name="direction"
            label="Direction"
            options={DIRECTION_OPTIONS}
          />
          <FormInput
            name="description"
            label="Short description"
            classNames={{ root: 'sm:col-span-2' }}
          />
          <FormInput
            name="avgSpeedKmh"
            label="Typical speed (km/h)"
            type="number"
            valueAsNumber
          />
          <FormInput
            name="color"
            label="Route color"
            type="color"
            classNames={{ input: 'h-10 w-24 cursor-pointer p-1' }}
          />
        </div>
      </FormSection>

      <DeparturesField />
      <StopsField />

      <div className="bg-background/90 sticky bottom-0 flex justify-end gap-3 py-4 backdrop-blur">
        <Button
          type="button"
          variant="ghost"
          onClick={() => methods.reset()}
          disabled={!isDirty}
        >
          Discard changes
        </Button>
        <Button type="submit" size="lg" isLoading={isSaving}>
          Save route
        </Button>
      </div>
    </Form>
  );
}
