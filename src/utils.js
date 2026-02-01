/**
 * Utility functions for the configuration validator
 */

/**
 * Check if a value is empty (null, undefined, empty string, empty object/array)
 * @param {any} value - Value to check
 * @returns {boolean}
 */
function isEmpty(value) {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value === 'string' && value.trim() === '') {
    return true;
  }
  if (Array.isArray(value) && value.length === 0) {
    return true;
  }
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return true;
  }
  return false;
}

/**
 * Get the type of a value as a string
 * @param {any} value - Value to check
 * @returns {string}
 */
function getType(value) {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
}

/**
 * Deep clone an object
 * @param {object} obj - Object to clone
 * @returns {object}
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Check if a string is a valid email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if a string is a valid URL
 * @param {string} url - URL to validate
 * @returns {boolean}
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value is within a numeric range
 * @param {number} value - Value to check
 * @param {number} min - Minimum allowed value (inclusive)
 * @param {number} max - Maximum allowed value (inclusive)
 * @returns {boolean}
 */
function isWithinRange(value, min, max) {
  const numValue = Number(value);
  if (Number.isNaN(numValue)) return false;
  return numValue >= min && numValue <= max;
}

/**
 * Check if a value matches a given pattern (regex)
 * @param {string} value - Value to check
 * @param {string|RegExp} pattern - Pattern to match
 * @returns {boolean}
 */
function matchesPattern(value, pattern) {
  const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
  return regex.test(String(value));
}

/**
 * Common weak passwords to check against
 */
const COMMON_WEAK_PASSWORDS = [
  'password',
  '123456',
  '12345678',
  'qwerty',
  'abc123',
  'password123',
  'admin',
  'letmein',
  'welcome',
  '1q2w3e4r',
  'monkey',
  'dragon',
  'master',
  'sunshine',
  'princess',
  '1234567890',
];

/**
 * Check if a password is weak
 * @param {string} password - Password to check
 * @returns {object} { isWeak: boolean, reason: string|null }
 */
function checkPasswordStrength(password) {
  if (!password || typeof password !== 'string') {
    return { isWeak: true, reason: 'Password must be a string' };
  }

  if (password.length < 8) {
    return { isWeak: true, reason: 'Password length less than 8 characters' };
  }

  if (COMMON_WEAK_PASSWORDS.includes(password.toLowerCase())) {
    return { isWeak: true, reason: 'Common weak password detected' };
  }

  return { isWeak: false, reason: null };
}

/**
 * Check if a key name suggests a secret value
 * @param {string} key - Key name to check
 * @returns {boolean}
 */
function isSuspiciousSecretKey(key) {
  const secretPatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /api[_-]?key/i,
    /auth/i,
    /apikey/i,
    /private[_-]?key/i,
    /aws[_-]?(secret|access)[_-]?key/i,
    /sql[_-]?password/i,
  ];

  return secretPatterns.some((pattern) => pattern.test(key));
}

module.exports = {
  isEmpty,
  getType,
  deepClone,
  isValidEmail,
  isValidUrl,
  isWithinRange,
  matchesPattern,
  checkPasswordStrength,
  isSuspiciousSecretKey,
  COMMON_WEAK_PASSWORDS,
};
