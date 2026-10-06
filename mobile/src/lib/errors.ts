import axios from 'axios';
import type {ApiErrorBody} from '../types/api';

/** True when the request never reached a server response (offline / DNS / timeout without status). */
export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && !error.response;
}

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!axios.isAxiosError(error)) {
    if (__DEV__ && error instanceof Error) {
      return error.message;
    }
    return fallback;
  }

  const status = error.response?.status;
  const data = error.response?.data as ApiErrorBody | undefined;

  if (status === 401) {
    return 'Please sign in again.';
  }
  if (status === 403) {
    return 'You do not have permission to do that.';
  }
  if (status === 404) {
    return data?.error || 'Not found.';
  }
  if (status === 429) {
    return data?.error || 'Too many requests. Try again shortly.';
  }
  if (status && status >= 500) {
    return 'Server error. Please try again later.';
  }

  if (data?.error && typeof data.error === 'string') {
    // Never surface stack traces or internal paths to users.
    if (/stack|exception|at\s+\w+\s*\(/i.test(data.error)) {
      return fallback;
    }
    return data.error;
  }

  if (!error.response) {
    return 'Could not reach the server. Check your connection.';
  }

  return fallback;
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
