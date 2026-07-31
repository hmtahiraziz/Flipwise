import axios from 'axios';
import type {ApiErrorBody} from '../types/api';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  if (data?.error) {
    return data.error;
  }

  return error.message || fallback;
}

export function getValidationErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError(error)) {
    return {};
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  if (!data?.details?.length) {
    return {};
  }

  return data.details.reduce<Record<string, string>>((acc, item) => {
    acc[item.path] = item.message;
    return acc;
  }, {});
}

function isAbortError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  return (
    error.code === 'ERR_CANCELED' ||
    error.name === 'CanceledError' ||
    error.message.toLowerCase().includes('cancel')
  );
}

export type GenerateErrorCopy = {
  title: string;
  message: string;
  cancelled?: boolean;
};

/** User-facing copy for AI generate failures (rate limits, AI busy, network, cancel). */
export function getGenerateErrorMessage(
  error: unknown,
  fallback = 'Something went wrong. Please try again.',
): GenerateErrorCopy {
  if (isAbortError(error)) {
    return {
      title: 'Cancelled',
      message: 'Generation was stopped.',
      cancelled: true,
    };
  }

  if (!axios.isAxiosError(error)) {
    return {
      title: 'Generation failed',
      message: error instanceof Error ? error.message : fallback,
    };
  }

  const status = error.response?.status;
  const apiMessage = getApiErrorMessage(error);

  if (status === 429) {
    return {
      title: 'Limit reached',
      message:
        apiMessage ||
        'Too many generation requests. Wait a few minutes, then try again.',
    };
  }

  if (status === 400) {
    return {
      title: 'Check your input',
      message: apiMessage || 'Add more detail to your topic or notes.',
    };
  }

  if (status === 502 || status === 503) {
    return {
      title: 'AI unavailable',
      message:
        apiMessage ||
        'The AI service is busy or returned poor results. Try again in a moment.',
    };
  }

  if (error.code === 'ECONNABORTED') {
    return {
      title: 'Timed out',
      message: 'Generation took too long. Try fewer cards or shorter notes.',
    };
  }

  if (!error.response) {
    return {
      title: 'Connection error',
      message: 'Could not reach the server. Check your internet and try again.',
    };
  }

  return {
    title: 'Generation failed',
    message: apiMessage || fallback,
  };
}
