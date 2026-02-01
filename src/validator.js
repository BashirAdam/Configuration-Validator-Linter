/**
 * Core validation engine for configuration validation
 */

const utils = require('./utils');
const rules = require('./rules');

/**
 * Validate a configuration value against a rule definition
 * @param {any} value - Value to validate
 * @param {object} rule - Rule definition with type, constraints, etc.
 * @param {string} key - Key name (for error messages)
 * @returns {array} Array of error messages, empty if valid
 */
function validateValue(value, rule, key) {
  const errors = [];

  // Check for empty/null values if not allowed
  if (rule.notEmpty && utils.isEmpty(value)) {
    errors.push(`Value cannot be empty`);
    return errors;
  }

  // Type checking
  if (rule.type) {
    const actualType = utils.getType(value);
    if (actualType !== rule.type) {
      errors.push(
        `Invalid type '${actualType}', expected '${rule.type}'`
      );
      return errors;
    }
  }

  // String-specific validations
  if (rule.type === 'string' && typeof value === 'string') {
    if (rule.minLength && value.length < rule.minLength) {
      errors.push(
        `String length is ${value.length}, minimum is ${rule.minLength}`
      );
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(
        `String length is ${value.length}, maximum is ${rule.maxLength}`
      );
    }

    if (rule.pattern && !utils.matchesPattern(value, rule.pattern)) {
      errors.push(
        `Value does not match required pattern`
      );
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(
        `Value must be one of: ${rule.enum.join(', ')}`
      );
    }
  }

  // Number-specific validations
  if (rule.type === 'number' && typeof value === 'number') {
    if (rule.min !== undefined && value < rule.min) {
      errors.push(`Value is ${value}, minimum is ${rule.min}`);
    }

    if (rule.max !== undefined && value > rule.max) {
      errors.push(`Value is ${value}, maximum is ${rule.max}`);
    }

    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`Value must be one of: ${rule.enum.join(', ')}`);
    }
  }

  // Boolean-specific validations
  if (rule.type === 'boolean' && typeof value === 'boolean') {
    if (rule.enum && !rule.enum.includes(value)) {
      errors.push(`Value must be one of: ${rule.enum.join(', ')}`);
    }
  }

  return errors;
}

/**
 * Validate a configuration object against a schema
 * @param {object} config - Configuration object to validate
 * @param {object} schema - Schema definition
 * @returns {array} Array of issue objects
 */
function validateSchema(config, schema) {
  const issues = [];

  // Check for missing required keys
  if (schema.requiredKeys) {
    for (const key of schema.requiredKeys) {
      if (!(key in config)) {
        issues.push({
          key,
          severity: 'ERROR',
          message: 'Missing required key',
          rule: 'missing_required_key',
        });
      }
    }
  }

  // Check all keys in config against rules
  const allAllowedKeys = [
    ...(schema.requiredKeys || []),
    ...(schema.optionalKeys || []),
  ];
  const hasAllowedList = schema.requiredKeys || schema.optionalKeys;

  for (const key in config) {
    const value = config[key];

    // Check for unexpected keys
    if (hasAllowedList && !allAllowedKeys.includes(key)) {
      issues.push({
        key,
        severity: 'WARNING',
        message: 'Unexpected key not defined in schema',
        rule: 'unexpected_key',
      });
    }

    // Validate against rule if defined
    if (schema.rules && schema.rules[key]) {
      const rule = schema.rules[key];
      const validationErrors = validateValue(value, rule, key);

      for (const error of validationErrors) {
        issues.push({
          key,
          severity: 'ERROR',
          message: error,
          rule: 'validation_error',
        });
      }
    }
  }

  return issues;
}

/**
 * Validate a configuration object with both schema and security rules
 * @param {object} config - Configuration object to validate
 * @param {object} schema - Schema definition
 * @returns {object} Validation result with issues organized by type
 */
function validateConfiguration(config, schema) {
  const issues = [];

  // Run schema validation
  const schemaIssues = validateSchema(config, schema);
  issues.push(...schemaIssues);

  // Run security rules on each config item
  for (const key in config) {
    const value = config[key];
    const securityIssues = rules.applySecurityRules(key, value, config);
    issues.push(...securityIssues);
  }

  // Organize issues by severity
  const errors = issues.filter((issue) => issue.severity === 'ERROR');
  const warnings = issues.filter((issue) => issue.severity === 'WARNING');

  return {
    isValid: errors.length === 0,
    issues,
    errors,
    warnings,
    summary: {
      total: issues.length,
      errorCount: errors.length,
      warningCount: warnings.length,
    },
  };
}

module.exports = {
  validateValue,
  validateSchema,
  validateConfiguration,
};
