import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combine class
 * @param inputs
 * @type {typeof import('clsx')}
 * @returns {string}
 * @param {(ClassDictionary | string | number | bigint | boolean)[]} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
