import { toast } from 'sonner';
import { getApiErrorDetails } from './helpers';

export const toastApiError = (error: unknown, fallback?: string) => {
  const { title, description } = getApiErrorDetails(error, fallback);

  return toast.error(title, { description });
};
