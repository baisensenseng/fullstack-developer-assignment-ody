import { authTokenStorageKey } from '@ody/types';

/**
 * Description: Implements readStoredToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function readStoredToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(authTokenStorageKey);
}

/**
 * Description: Implements writeStoredToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function writeStoredToken(token: string) {
  if (typeof window !== 'undefined') window.localStorage.setItem(authTokenStorageKey, token);
}

/**
 * Description: Implements clearStoredToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function clearStoredToken() {
  if (typeof window !== 'undefined') window.localStorage.removeItem(authTokenStorageKey);
}
