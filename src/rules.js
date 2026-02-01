/**
 * Security linting rules for configuration validation
 */

const utils = require('./utils');

/**
 * Security rule definitions
 */

/**
 * Check for weak passwords
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkWeakPassword(key, value) {
  if (!utils.isSuspiciousSecretKey(key)) {
    return null;
  }

  if (typeof value !== 'string') {
    return null;
  }

  const result = utils.checkPasswordStrength(value);
  if (result.isWeak) {
    return {
      key,
      severity: 'WARNING',
      message: `Weak password detected: ${result.reason}`,
      rule: 'weak_password',
    };
  }

  return null;
}

/**
 * Check for hardcoded secrets (suspicious values that look like secrets)
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkHardcodedSecret(key, value) {
  if (typeof value !== 'string') {
    return null;
  }

  if (!utils.isSuspiciousSecretKey(key)) {
    return null;
  }

  // Check if value is hardcoded (not a placeholder like ${...} or env var)
  if (value.startsWith('${') || value.startsWith('$')) {
    return null;
  }

  // Check if it looks like actual credentials
  if (value.length > 0 && value !== 'CHANGE_ME' && value !== 'YOUR_KEY_HERE') {
    return {
      key,
      severity: 'WARNING',
      message: 'Hardcoded secret detected. Use environment variables instead.',
      rule: 'hardcoded_secret',
    };
  }

  return null;
}

/**
 * Check for unsafe port assignments
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkUnsafePort(key, value) {
  if (!key.toLowerCase().includes('port')) {
    return null;
  }

  if (typeof value !== 'number' && typeof value !== 'string') {
    return null;
  }

  const port = Number(value);
  if (Number.isNaN(port)) {
    return null;
  }

  if (port > 0 && port < 1024) {
    return {
      key,
      severity: 'ERROR',
      message: `Unsafe port ${port}. Ports below 1024 require elevated privileges and may cause conflicts.`,
      rule: 'unsafe_port',
    };
  }

  return null;
}

/**
 * Check for public/unsafe network bindings
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkPublicBinding(key, value) {
  if (typeof value !== 'string') {
    return null;
  }

  const publicPatterns = ['0.0.0.0', '::', '127.0.0.1'];

  if (key.toLowerCase().includes('host') || key.toLowerCase().includes('bind')) {
    if (value === '0.0.0.0' || value === '::') {
      return {
        key,
        severity: 'WARNING',
        message: 'Public network binding detected. Ensure this is intentional.',
        rule: 'public_binding',
      };
    }
  }

  return null;
}

/**
 * Check for insecure protocols
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkInsecureProtocol(key, value) {
  if (typeof value !== 'string') {
    return null;
  }

  if (key.toLowerCase().includes('url') || key.toLowerCase().includes('uri')) {
    if (value.startsWith('http://') && !value.includes('localhost')) {
      return {
        key,
        severity: 'WARNING',
        message: 'Insecure HTTP protocol used. Consider using HTTPS.',
        rule: 'insecure_protocol',
      };
    }
  }

  return null;
}

/**
 * Check for debugging enabled in production
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @param {object} fullConfig - Full configuration object
 * @returns {object|null} Issue object or null if no issue
 */
function checkDebugInProduction(key, value, fullConfig) {
  if (key.toLowerCase() === 'debug' && value === true) {
    const environment =
      fullConfig.environment ||
      fullConfig.ENV ||
      fullConfig.NODE_ENV ||
      '';
    if (
      environment.toLowerCase() === 'production' ||
      environment.toLowerCase() === 'prod'
    ) {
      return {
        key,
        severity: 'ERROR',
        message: 'Debug mode enabled in production environment.',
        rule: 'debug_in_production',
      };
    }
  }

  return null;
}

/**
 * Check for missing default values where they should exist
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @returns {object|null} Issue object or null if no issue
 */
function checkMissingDefaults(key, value) {
  if (value === null || value === undefined) {
    return {
      key,
      severity: 'ERROR',
      message: 'Configuration key has no value.',
      rule: 'missing_value',
    };
  }

  return null;
}

/**
 * Apply all security rules to a configuration value
 * @param {string} key - Configuration key name
 * @param {any} value - Configuration value
 * @param {object} fullConfig - Full configuration object
 * @returns {array} Array of issue objects found
 */
function applySecurityRules(key, value, fullConfig) {
  const issues = [];

  // Apply each rule
  const rules = [
    (k, v) => checkWeakPassword(k, v),
    (k, v) => checkHardcodedSecret(k, v),
    (k, v) => checkUnsafePort(k, v),
    (k, v) => checkPublicBinding(k, v),
    (k, v) => checkInsecureProtocol(k, v),
    (k, v) => checkDebugInProduction(k, v, fullConfig),
    (k, v) => checkMissingDefaults(k, v),
  ];

  for (const rule of rules) {
    const issue = rule(key, value);
    if (issue) {
      issues.push(issue);
    }
  }

  return issues;
}

module.exports = {
  checkWeakPassword,
  checkHardcodedSecret,
  checkUnsafePort,
  checkPublicBinding,
  checkInsecureProtocol,
  checkDebugInProduction,
  checkMissingDefaults,
  applySecurityRules,
};
