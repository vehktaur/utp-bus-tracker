import { useFieldArray } from 'react-hook-form';
import { LuPlus, LuX } from '~/assets/icons';
import { Button } from '~/components/ui/button';
import FormErrorMessage from '~/components/ui/error-message';
import FormInput from '~/components/ui/input';
import type { BusRouteValues } from '~/utils/schemas/busRouteSchema';
import FormSection from './FormSection';

export default function DeparturesField() {
  const { fields, append, remove } = useFieldArray<
    BusRouteValues,
    'departures'
  >({ name: 'departures' });

  return (
    <FormSection
      title="Departures"
      description="When the bus leaves the first stop, every day."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ time: '' })}
        >
          <LuPlus />
          Add time
        </Button>
      }
    >
      <ul className="flex flex-wrap gap-3">
        {fields.map((field, index) => (
          <li key={field.id} className="flex items-start gap-1">
            <FormInput
              name={`departures.${index}.time`}
              type="time"
              aria-label={`Departure ${index + 1}`}
              classNames={{ root: 'w-32', input: 'tabular-nums' }}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => remove(index)}
              disabled={fields.length === 1}
              aria-label={`Remove departure ${index + 1}`}
            >
              <LuX />
            </Button>
          </li>
        ))}
      </ul>
      <FormErrorMessage name="departures.root" id="departures-error" />
    </FormSection>
  );
}
