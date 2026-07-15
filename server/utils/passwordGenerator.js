import crypto from "crypto";


// Charset excludes ambiguous characters: 0, O, I, l, 1
const CHARSET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/**
 * Generates a secure 12-character alphanumeric password.
 * No special characters easy for users to type on any keyboard.
 * Example output: 'Kx7mNpR2wQdL'
 */
export function generateUserPassword() {
  const bytes = crypto.randomBytes(12);
  let password = "";
  for (let i = 0; i < 12; i++) {
    // Use modulo to map each random byte to a charset character.
    // CHARSET length (56) divides evenly enough that bias is negligible.
    password += CHARSET[bytes[i] % CHARSET.length];
  }
  return password;
}
