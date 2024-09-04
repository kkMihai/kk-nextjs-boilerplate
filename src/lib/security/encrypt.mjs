import crypto from 'crypto';
import { env } from '@/env.mjs';

const baseKey = env.ENCRYPTION_SECRET_KEY;
const salt = env.ENCRYPTION_SALT;
const iterations = 100000;
const keyLength = 32;
const algorithm = env.ENCRYPTION_ALGORITHM;
const hmacKey = env.ENCRYPTION_HMAC_KEY;


/**
 * Derive key from base key and salt
 * @param baseKey
 * @param salt
 * @returns {Buffer}
 * @private
 */
function deriveKey(baseKey, salt) {
  return crypto.pbkdf2Sync(baseKey, salt, iterations, keyLength, "sha256");
}


/**
 * Generate HMAC for data
 * @private
 * @param {string} key - HMAC key
 * @param {string} data - Data to generate HMAC for
 * @returns {string} - HMAC for the data
 */
function generateHmac(key, data) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
}


/**
 * Encrypt data
 * @param data
 * @returns {string}
 */
export function encrypt(data) {
  if (!data) throw new Error("Data to encrypt must be provided.");

  const iv = crypto.randomBytes(16);
  const key = deriveKey(baseKey, salt);
  const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: 16 });

  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  const hmac = generateHmac(hmacKey, iv.toString("hex") + encrypted);

  return `${iv.toString("hex")}:${encrypted}:${hmac}`;
}

/**
 * Decrypt data
 * @param encryptedData
 * @returns {string}
 */
export function decrypt(encryptedData) {
  if (!encryptedData) throw new Error("Encrypted data must be provided.");

  const [ivHex, encrypted, receivedHmac] = encryptedData.split(":");
  if (!ivHex || !encrypted || !receivedHmac) {
    throw new Error("Invalid encrypted data format.");
  }

  const iv = Buffer.from(ivHex, "hex");
  const key = deriveKey(baseKey, salt);

  const computedHmac = generateHmac(hmacKey, ivHex + encrypted);

  if (receivedHmac !== computedHmac) {
    throw new Error("HMAC validation failed. The data may be tampered.");
  }

  try {
    const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: 16 });

    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("Decryption error:", error.message);
    throw new Error(
      "Decryption failed. The provided data may be corrupted or invalid.",
    );
  }
}
