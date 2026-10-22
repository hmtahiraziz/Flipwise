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

/** Friendlier copy for scan / OCR failures (Android + iOS). */
export function getOcrErrorMessage(error: unknown): string {
  const raw = getApiErrorMessage(error, '');
  const lower = raw.toLowerCase();

  if (
    lower.includes('could not be verified') ||
    lower.includes('file type') ||
    lower.includes('heic') ||
    lower.includes('heif') ||
    lower.includes('only jpeg')
  ) {
    return 'Use a JPEG or PNG photo. On some phones, retake the picture instead of picking HEIC.';
  }
  if (
    lower.includes('image file is required') ||
    lower.includes('could not process this photo') ||
    lower.includes('could not process image')
  ) {
    return 'Could not upload that photo. Retake with the camera, then tap Run OCR.';
  }
  if (lower.includes('8 mb') || lower.includes('exceeds')) {
    return 'Photo is too large. Try a clearer, closer shot under 8 MB.';
  }
  if (
    lower.includes('could not read text') ||
    lower.includes('empty') ||
    lower.includes('no readable text') ||
    lower.includes('scanned pdf')
  ) {
    return 'No readable text found. Retake with better lighting, use Camera scan, or paste notes.';
  }
  if (lower.includes('timed out') || lower.includes('timeout')) {
    return 'OCR timed out. Crop closer to the notes and try again.';
  }
  if (lower.includes('ocr failed') || lower.includes('busy')) {
    return 'OCR is busy. Wait a moment, then tap Run OCR again.';
  }
  if (
    axios.isAxiosError(error) &&
    error.response?.status === 429
  ) {
    return 'Daily scan limit reached. Try again tomorrow or paste text manually.';
  }
  if (!error || (axios.isAxiosError(error) && !error.response)) {
    return 'Could not reach the server. Check Wi‑Fi/USB and try again.';
  }
  return raw || 'Scan failed. Retake the page or paste text below.';
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

/** User-facing copy for Explain with AI failures (offline, quota, missing API key). */
export function getExplainErrorMessage(error: unknown): string {
  if (isNetworkError(error)) {
    return 'You appear to be offline. Check your connection and try again.';
  }

  if (!axios.isAxiosError(error)) {
    return error instanceof Error
      ? error.message
      : 'Could not generate an explanation. Please try again.';
  }

  const status = error.response?.status;
  const apiMessage = getApiErrorMessage(
    error,
    'Could not generate an explanation. Please try again.',
  );
  const lower = apiMessage.toLowerCase();

  if (status === 429) {
    return (
      apiMessage ||
      'Daily explain limit reached. Try again tomorrow.'
    );
  }

  if (
    status === 503 ||
    lower.includes('api key') ||
    lower.includes('not configured') ||
    lower.includes('authentication') ||
    lower.includes('unauthorized')
  ) {
    return 'AI is unavailable right now. The server may need an OpenAI API key. Try again later.';
  }

  if (status === 502) {
    return (
      apiMessage ||
      'AI could not generate an explanation. Please try again.'
    );
  }

  if (!error.response) {
    return 'You appear to be offline. Check your connection and try again.';
  }

  return apiMessage;
}

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
