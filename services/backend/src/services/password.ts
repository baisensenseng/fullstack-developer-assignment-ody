const encoder = new TextEncoder();
const iterations = 100_000;
const keyLength = 32;

/**
 * Description: Implements toBase64.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function toBase64(buffer: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Description: Implements fromBase64.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

/**
 * Description: Implements hashPassword.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations },
    key,
    keyLength * 8
  );

  return `pbkdf2_sha256$${iterations}$${toBase64(salt.buffer)}$${toBase64(bits)}`;
}

/**
 * Description: Implements verifyPassword.
 * Parameters: See the TypeScript signature for accepted inputs.
 * Returns: See the TypeScript return type for output details.
 */
export async function verifyPassword(password: string, storedHash: string) {
  const [, iterationValue, saltValue, hashValue] = storedHash.split('$');
  if (!iterationValue || !saltValue || !hashValue) return false;

  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: fromBase64(saltValue), iterations: Number(iterationValue) },
    key,
    keyLength * 8
  );

  return toBase64(bits) === hashValue;
}
