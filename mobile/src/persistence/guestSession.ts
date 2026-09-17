import type { PersistedSession } from '../models/types';

/** Prefer the last promoted anonymous uid so Continue as guest does not mint guest-* again. */
export function restoreAnonymousGuestSession(input: {
  lastAnonymous: PersistedSession | null;
  deviceGuestUid: string | null;
}): PersistedSession | null {
  if (input.lastAnonymous?.isAnonymous && input.lastAnonymous.uid) {
    return {
      uid: input.lastAnonymous.uid,
      email: input.lastAnonymous.email ?? '',
      isAnonymous: true,
      provider: 'anonymous',
    };
  }
  if (input.deviceGuestUid) {
    return {
      uid: input.deviceGuestUid,
      email: '',
      isAnonymous: true,
      provider: 'anonymous',
    };
  }
  return null;
}
