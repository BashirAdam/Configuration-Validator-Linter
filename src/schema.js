/**
 * Schema definitions for configuration validation
 */

/**
 * Define a schema for configuration validation
 * Schema structure:
 * {
 *   requiredKeys: ['key1', 'key2'],  // Keys that must be present
 *   optionalKeys: ['key3', 'key4'],  // Keys that may be present
 *   rules: {
 *     key1: { type: 'string', ... },  // Validation rules for each key
 *   }
 * }
 */

const defaultSchema = {
  requiredKeys: [],
  optionalKeys: [],
  rules: {},
};

/**
 * Common rule validators
 */
const RULE_TYPES = {
  string: 'string',
  number: 'number',
  boolean: 'boolean',
  object: 'object',
  array: 'array',
};

/**
 * Create a schema for a basic application configuration
 * @returns {object}
 */
function createApplicationSchema() {
  return {
    requiredKeys: [
      'app_name',
      'environment',
      'database_url',
      'port',
      'api_key',
    ],
    optionalKeys: ['debug', 'log_level', 'cache_enabled', 'description'],
    rules: {
      app_name: {
        type: 'string',
        notEmpty: true,
      },
      environment: {
        type: 'string',
        enum: ['development', 'staging', 'production'],
      },
      database_url: {
        type: 'string',
        notEmpty: true,
      },
      port: {
        type: 'number',
        min: 1024,
        max: 65535,
      },
      api_key: {
        type: 'string',
        notEmpty: true,
      },
      debug: {
        type: 'boolean',
      },
      log_level: {
        type: 'string',
        enum: ['debug', 'info', 'warn', 'error'],
      },
      cache_enabled: {
        type: 'boolean',
      },
      description: {
        type: 'string',
      },
    },
  };
}

/**
 * Create a schema for a database configuration
 * @returns {object}
 */
function createDatabaseSchema() {
  return {
    requiredKeys: ['host', 'port', 'database', 'user', 'password'],
    optionalKeys: ['ssl', 'pool_size', 'timeout'],
    rules: {
      host: {
        type: 'string',
        notEmpty: true,
      },
      port: {
        type: 'number',
        min: 1024,
        max: 65535,
      },
      database: {
        type: 'string',
        notEmpty: true,
      },
      user: {
        type: 'string',
        notEmpty: true,
      },
      password: {
        type: 'string',
        notEmpty: true,
      },
      ssl: {
        type: 'boolean',
      },
      pool_size: {
        type: 'number',
        min: 1,
        max: 1000,
      },
      timeout: {
        type: 'number',
        min: 100,
        max: 300000,
      },
    },
  };
}

/**
 * Create a schema for authentication configuration
 * @returns {object}
 */
function createAuthSchema() {
  return {
    requiredKeys: ['jwt_secret', 'session_timeout'],
    optionalKeys: ['password_hash_rounds', 'mfa_enabled', 'oauth_provider'],
    rules: {
      jwt_secret: {
        type: 'string',
        notEmpty: true,
        minLength: 32,
      },
      session_timeout: {
        type: 'number',
        min: 300,
        max: 86400,
      },
      password_hash_rounds: {
        type: 'number',
        min: 8,
        max: 15,
      },
      mfa_enabled: {
        type: 'boolean',
      },
      oauth_provider: {
        type: 'string',
        enum: ['google', 'github', 'microsoft', 'none'],
      },
    },
  };
}

/**
 * Get a predefined schema by name
 * @param {string} schemaName - Name of the schema (e.g., 'application', 'database')
 * @returns {object|null}
 */
function getSchemaByName(schemaName) {
  const schemas = {
    application: createApplicationSchema(),
    database: createDatabaseSchema(),
    auth: createAuthSchema(),
  };

  return schemas[schemaName] || null;
}

/**
 * Merge multiple schemas into one
 * @param {...object} schemas - Schemas to merge
 * @returns {object}
 */
function mergeSchemas(...schemas) {
  const merged = {
    requiredKeys: [],
    optionalKeys: [],
    rules: {},
  };

  for (const schema of schemas) {
    if (schema.requiredKeys) {
      merged.requiredKeys = [
        ...new Set([...merged.requiredKeys, ...schema.requiredKeys]),
      ];
    }
    if (schema.optionalKeys) {
      merged.optionalKeys = [
        ...new Set([...merged.optionalKeys, ...schema.optionalKeys]),
      ];
    }
    if (schema.rules) {
      merged.rules = { ...merged.rules, ...schema.rules };
    }
  }

  return merged;
}

module.exports = {
  defaultSchema,
  RULE_TYPES,
  createApplicationSchema,
  createDatabaseSchema,
  createAuthSchema,
  getSchemaByName,
  mergeSchemas,
};
