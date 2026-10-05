import {CLERK_PUBLISHABLE_KEY} from '@env';

const rawKey = CLERK_PUBLISHABLE_KEY?.trim() ?? '';

export const clerkPublishableKey = rawKey;

export const isClerkConfigured =
  rawKey.length > 0 && rawKey.startsWith('pk_');

export const isClerkProductionKey = rawKey.startsWith('pk_live_');
