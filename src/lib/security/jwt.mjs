import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { env } from '@/env';


// Note: For RS512 the length of the key should be 2048 bits or bigger
const privateKeyPath = path.join(process.cwd(), "/.keys/private.pem");
const publicKeyPath = path.join(process.cwd(), "/.keys/public.pem");

const algorithm = env.JWT_ALGORITHM;

/**
 * Generate a new JWT token
 * @param payload - The data to be stored in the token as json (e.g. {id: 1, name: 'John'})
 * @param expiresIn - In how much time the token will expire (e.g. 1m, 1h, 1d)
 * @returns {*}
 */
export function generateToken(payload, expiresIn) {
  const privateKey = fs.readFileSync(privateKeyPath);
  const expiresInTime = expiresIn || "1m";
  return jwt.sign(payload, privateKey, {
    algorithm: algorithm,
    expiresIn: expiresInTime,
    issuer: env.host,
  });
}

/**
 * Verify a JWT token
 * @param token
 * @returns {*}
 */
export function verifyToken(token) {
  const publicKey = fs.readFileSync(publicKeyPath);
  const decoded = jwt.verify(token, publicKey, { algorithms: ["RS512"] });
  if (!decoded) {
    throw new Error("Token is not valid");
  }
  return decoded;
}
