let apiBaseUrl = 'http://localhost:8787';
let authToken: string | null = null;

/**
 * Description: Implements setApiBaseUrl.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function setApiBaseUrl(value: string) {
  apiBaseUrl = value.replace(/\/$/, '');
}

/**
 * Description: Implements setAuthToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function setAuthToken(value: string | null) {
  authToken = value;
}

/**
 * Description: Implements getApiBaseUrl.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function getApiBaseUrl() {
  return apiBaseUrl;
}

/**
 * Description: Implements getAuthToken.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export function getAuthToken() {
  return authToken;
}
