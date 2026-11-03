export type IMaybe<T> = T | null | undefined;

export type ApiErrorPayload = {
  message?: string;
  error?: string;
};
