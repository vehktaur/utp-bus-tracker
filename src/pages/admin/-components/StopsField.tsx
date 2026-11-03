import { useFieldArray, useFormContext } from 'react-hook-form';
import { toast } from 'sonner';
import {
  LuArrowDown,
  LuArrowUp,
  LuLocateFixed,
  LuPlus,
  LuTrash2,
} from '~/assets/icons';
import { Button } from '~/components/ui/button';
import FormErrorMessage from '~/components/ui/error-message';
import FormInput from '~/components/ui/input';
import type { BusRouteValues } from '~/utils/schemas/busRouteSchema';
import FormSection from './FormSection';

const NEW_STOP = {
  name: '',
  lat: Number.NaN,
  lng: Number.NaN,
  minutesFromStart: Number.NaN,
};

export default function StopsField() {
  const { setValue } = useFormContext<BusRouteValues>();
  const { fields, append, remove, swap } = useFieldArray<
    BusRouteValues,
    'stops'
  >({ name: 'stops' });

  // Handy when riding the route to record where each stop really is
  const fillFromCurrentLocation = (index: number) => {
    if (!('geolocation' in navigator)) {
      toast.error('This browser can’t read your location.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const options = { shouldDirty: true, shouldValidate: true };
        setValue(
          `stops.${index}.lat`,
          Number(coords.latitude.toFixed(6)),
          options,
        );
        setValue(
          `stops.${index}.lng`,
          Number(coords.longitude.toFixed(6)),
          options,
        );
        toast.success('Stop moved to your current location');
      },
      () => toast.error('Couldn’t get your location.'),
      { enableHighAccuracy: true, timeout: 15_000 },
    );
  };

  return (
    <FormSection
      title="Stops"
      description="In travel order. Minutes are counted from the first stop."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ ...NEW_STOP, id: crypto.randomUUID() })}
        >
          <LuPlus />
          Add stop
        </Button>
      }
    >
      <ol className="grid gap-4">
        {fields.map((field, index) => (
          <li
            key={field.id}
            className="grid gap-3 rounded-xl border p-3 sm:grid-cols-[2rem_minmax(0,2fr)_repeat(3,minmax(0,1fr))_auto] sm:items-start"
          >
            <span className="bg-muted grid size-8 place-items-center rounded-full text-sm font-semibold sm:mt-7">
              {index + 1}
            </span>
            <FormInput
              name={`stops.${index}.name`}
              label="Stop name"
              placeholder="e.g. UTP Main Gate"
            />
            <FormInput
              name={`stops.${index}.lat`}
              label="Latitude"
              type="number"
              step="any"
              valueAsNumber
            />
            <FormInput
              name={`stops.${index}.lng`}
              label="Longitude"
              type="number"
              step="any"
              valueAsNumber
            />
            <FormInput
              name={`stops.${index}.minutesFromStart`}
              label="Minute"
              type="number"
              min={0}
              valueAsNumber
            />

            <div className="flex gap-1 sm:mt-6">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fillFromCurrentLocation(index)}
                aria-label="Use my current location"
                title="Use my current location"
              >
                <LuLocateFixed />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => swap(index, index - 1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <LuArrowUp />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => swap(index, index + 1)}
                disabled={index === fields.length - 1}
                aria-label="Move down"
              >
                <LuArrowDown />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                disabled={fields.length <= 2}
                aria-label="Remove stop"
              >
                <LuTrash2 />
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <FormErrorMessage name="stops.root" id="stops-error" />
    </FormSection>
  );
}
