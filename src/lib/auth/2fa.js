import { Secret, TOTP } from 'otpauth';
import { decrypt, encrypt } from '@/lib/security/encrypt.mjs';

/**
 * @name generateTOTP
 * @description Generate a Time-based One-Time Password (TOTP) secret and OTP Auth URL
 * @param {string} email - Email address of the user
 * @returns {Object} - Encrypted secret and OTP Auth URL
 * @type {Function}
 */
export function generateTOTP(email) {
  const secret = new Secret({ size: 21 });
  const totp = new TOTP({
    issuer: process.env.APP_NAME,
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: secret.base32,
  });

  const otpAuthUrl = totp.toString();
  const encryptedSecret = encrypt(secret.base32);

  return { encryptedSecret, otpAuthUrl };
}

/**
 * @name validateTOTP
 * @param encryptedSecret
 * @param token
 * @returns {number}
 */
export function validateTOTP(encryptedSecret, token) {
  const decryptedSecret = decrypt(encryptedSecret);
  const totp = new TOTP({
    secret: Secret.fromBase32(decryptedSecret),
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  return totp.validate({
    token,
    window: 1,
    timestamp: Date.now() - 30 * 1000, // subtract 30 seconds to account for time drift
  });
}
