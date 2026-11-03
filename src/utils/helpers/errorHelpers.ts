import axios from 'axios';
import type { ApiErrorPayload } from '~/types';
import { DEFAULT_API_ERROR } from '../constants';

export type ApiErrorDetails = {
  title: string;
  description?: string;
};

export const getApiErrorDetails = (
  error: unknown,
  fallback: string = DEFAULT_API_ERROR,
): ApiErrorDetails => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const data = error.response?.data;
    return { title: data?.message || data?.error || error.message || fallback };
  }

  if (error instanceof Error) return { title: error.message || fallback };

  return { title: fallback };
};

export const getApiError = (
  error: unknown,
  fallback: string = DEFAULT_API_ERROR,
) => getApiErrorDetails(error, fallback).title;
