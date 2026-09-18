const ALPHABET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

const MAX_VALID = 248;

export function generateShortCode(length = 6): string {
  let result = "";

  while (result.length < length) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);

    for (const byte of bytes) {
      if (byte >= MAX_VALID) continue;

      result += ALPHABET[byte % 62];

      if (result.length === length) break;
    }
  }

  return result;
}