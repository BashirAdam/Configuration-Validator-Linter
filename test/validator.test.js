/**
 * Unit tests for the Configuration Validator & Linter
 * Run with: node test/validator.test.js
 */

const validator = require('../src/validator');
const rules = require('../src/rules');
const utils = require('../src/utils');
const schema = require('../src/schema');

// Test framework utilities
let testCount = 0;
let passCount = 0;
let failCount = 0;

/**
 * Assert that a condition is true
 */
function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`  ✓ ${message}`);
  } else {
    failCount++;
    console.error(`  ✗ ${message}`);
  }
}

/**
 * Assert equality
 */
function assertEqual(actual, expected, message) {
  const condition = JSON.stringify(actual) === JSON.stringify(expected);
  assert(condition, message);
  if (!condition) {
    console.error(`    Expected: ${JSON.stringify(expected)}`);
    console.error(`    Actual: ${JSON.stringify(actual)}`);
  }
}

/**
 * Test suite
 */
function describe(suiteName, testFunc) {
  console.log(`\n${suiteName}`);
  testFunc();
}

// ============= TESTS =============

describe('Utils - Type Detection', () => {
  assert(utils.getType('hello') === 'string', 'detects string type');
  assert(utils.getType(123) === 'number', 'detects number type');
  assert(utils.getType(true) === 'boolean', 'detects boolean type');
  assert(utils.getType([1, 2, 3]) === 'array', 'detects array type');
  assert(utils.getType({ a: 1 }) === 'object', 'detects object type');
  assert(utils.getType(null) === 'null', 'detects null type');
});

describe('Utils - Empty Value Detection', () => {
  assert(utils.isEmpty(null) === true, 'null is empty');
  assert(utils.isEmpty(undefined) === true, 'undefined is empty');
  assert(utils.isEmpty('') === true, 'empty string is empty');
  assert(utils.isEmpty('   ') === true, 'whitespace string is empty');
  assert(utils.isEmpty([]) === true, 'empty array is empty');
  assert(utils.isEmpty({}) === true, 'empty object is empty');
  assert(utils.isEmpty('hello') === false, 'non-empty string is not empty');
  assert(utils.isEmpty(123) === false, 'number is not empty');
});

describe('Utils - Password Strength', () => {
  const weakResult = utils.checkPasswordStrength('weak');
  assert(weakResult.isWeak === true, 'short password is weak');

  const commonResult = utils.checkPasswordStrength('password');
  assert(commonResult.isWeak === true, 'common password is weak');

  const strongResult = utils.checkPasswordStrength('Str0ng!Pass2024');
  assert(strongResult.isWeak === false, 'strong password is not weak');
});

describe('Utils - Secret Key Detection', () => {
  assert(
    utils.isSuspiciousSecretKey('password') === true,
    'detects "password" key'
  );
  assert(
    utils.isSuspiciousSecretKey('api_key') === true,
    'detects "api_key" key'
  );
  assert(
    utils.isSuspiciousSecretKey('auth_token') === true,
    'detects "auth_token" key'
  );
  assert(
    utils.isSuspiciousSecretKey('app_name') === false,
    'ignores non-secret keys'
  );
});

describe('Utils - Email Validation', () => {
  assert(
    utils.isValidEmail('user@example.com') === true,
    'validates correct email'
  );
  assert(
    utils.isValidEmail('invalid.email') === false,
    'rejects invalid email'
  );
  assert(utils.isValidEmail('test@domain.co.uk') === true, 'validates email with subdomain');
});

describe('Utils - URL Validation', () => {
  assert(
    utils.isValidUrl('https://example.com') === true,
    'validates HTTPS URL'
  );
  assert(utils.isValidUrl('http://localhost:3000') === true, 'validates localhost URL');
  assert(utils.isValidUrl('not a url') === false, 'rejects invalid URL');
});

describe('Utils - Range Checking', () => {
  assert(utils.isWithinRange(5, 1, 10) === true, 'value in range');
  assert(utils.isWithinRange(1, 1, 10) === true, 'min boundary');
  assert(utils.isWithinRange(10, 1, 10) === true, 'max boundary');
  assert(utils.isWithinRange(0, 1, 10) === false, 'value below range');
  assert(utils.isWithinRange(11, 1, 10) === false, 'value above range');
});

describe('Rules - Weak Password Detection', () => {
  const issue = rules.checkWeakPassword('db_password', 'weak');
  assert(issue !== null, 'detects weak password');
  assert(issue.severity === 'WARNING', 'weak password is warning');

  const noIssue = rules.checkWeakPassword('db_password', 'StrongPassword123');
  assert(noIssue === null, 'ignores strong password');

  const noKeyIssue = rules.checkWeakPassword('database_host', 'weak');
  assert(noKeyIssue === null, 'ignores non-secret keys');
});

describe('Rules - Hardcoded Secret Detection', () => {
  const issue = rules.checkHardcodedSecret('api_key', 'real_secret_key_12345');
  assert(issue !== null, 'detects hardcoded secret');

  const envVarIssue = rules.checkHardcodedSecret('api_key', '${API_KEY}');
  assert(envVarIssue === null, 'ignores environment variable placeholders');

  const nonSecretIssue = rules.checkHardcodedSecret('app_name', 'MyApp');
  assert(nonSecretIssue === null, 'ignores non-secret keys');
});

describe('Rules - Unsafe Port Detection', () => {
  const unsafeIssue = rules.checkUnsafePort('port', 80);
  assert(unsafeIssue !== null, 'detects unsafe port 80');
  assert(unsafeIssue.severity === 'ERROR', 'unsafe port is error');

  const safeIssue = rules.checkUnsafePort('port', 3000);
  assert(safeIssue === null, 'allows safe port 3000');

  const zeroIssue = rules.checkUnsafePort('port', 0);
  assert(zeroIssue === null, 'ignores port 0');
});

describe('Rules - Public Binding Detection', () => {
  const publicIssue = rules.checkPublicBinding('bind_address', '0.0.0.0');
  assert(publicIssue !== null, 'detects public binding 0.0.0.0');

  const localIssue = rules.checkPublicBinding('bind_address', '127.0.0.1');
  assert(localIssue === null, 'allows localhost binding');
});

describe('Rules - Insecure Protocol Detection', () => {
  const httpIssue = rules.checkInsecureProtocol('database_url', 'http://api.example.com');
  assert(httpIssue !== null, 'detects HTTP protocol');

  const httpsIssue = rules.checkInsecureProtocol('database_url', 'https://api.example.com');
  assert(httpsIssue === null, 'allows HTTPS protocol');

  const localhostIssue = rules.checkInsecureProtocol('api_url', 'http://localhost:3000');
  assert(localhostIssue === null, 'allows HTTP localhost');
});

describe('Rules - Debug in Production Detection', () => {
  const config = { debug: true, environment: 'production' };
  const issue = rules.checkDebugInProduction('debug', true, config);
  assert(issue !== null, 'detects debug in production');

  const devConfig = { debug: true, environment: 'development' };
  const noIssue = rules.checkDebugInProduction('debug', true, devConfig);
  assert(noIssue === null, 'allows debug in development');
});

describe('Validator - Type Validation', () => {
  const stringRule = { type: 'string' };
  const stringErrors = validator.validateValue('hello', stringRule, 'key');
  assert(stringErrors.length === 0, 'valid string passes');

  const numberErrors = validator.validateValue(123, stringRule, 'key');
  assert(numberErrors.length > 0, 'number fails string validation');
});

describe('Validator - String Length Validation', () => {
  const rule = { type: 'string', minLength: 5, maxLength: 10 };
  assert(
    validator.validateValue('hello', rule, 'key').length === 0,
    'string within length range passes'
  );

  assert(
    validator.validateValue('hi', rule, 'key').length > 0,
    'string below min length fails'
  );

  assert(
    validator.validateValue('verylongstring', rule, 'key').length > 0,
    'string above max length fails'
  );
});

describe('Validator - Number Range Validation', () => {
  const rule = { type: 'number', min: 1, max: 100 };
  assert(
    validator.validateValue(50, rule, 'key').length === 0,
    'number within range passes'
  );

  assert(
    validator.validateValue(0, rule, 'key').length > 0,
    'number below min fails'
  );

  assert(
    validator.validateValue(101, rule, 'key').length > 0,
    'number above max fails'
  );
});

describe('Validator - Enum Validation', () => {
  const rule = { type: 'string', enum: ['dev', 'staging', 'prod'] };
  assert(
    validator.validateValue('dev', rule, 'key').length === 0,
    'valid enum value passes'
  );

  assert(
    validator.validateValue('production', rule, 'key').length > 0,
    'invalid enum value fails'
  );
});

describe('Validator - Schema Validation', () => {
  const schema = {
    requiredKeys: ['name', 'port'],
    optionalKeys: ['description'],
    rules: {
      name: { type: 'string' },
      port: { type: 'number', min: 1, max: 65535 },
    },
  };

  const validConfig = { name: 'MyApp', port: 3000 };
  const result = validator.validateSchema(validConfig, schema);
  assert(result.length === 0, 'valid config passes schema validation');

  const missingConfig = { name: 'MyApp' };
  const missingResult = validator.validateSchema(missingConfig, schema);
  assert(
    missingResult.some((i) => i.rule === 'missing_required_key'),
    'missing required key detected'
  );

  const invalidConfig = { name: 'MyApp', port: 70000 };
  const invalidResult = validator.validateSchema(invalidConfig, schema);
  assert(
    invalidResult.some((i) => i.rule === 'validation_error'),
    'invalid value detected'
  );
});

describe('Validator - Full Configuration Validation', () => {
  const testSchema = {
    requiredKeys: ['api_key', 'port'],
    optionalKeys: ['debug'],
    rules: {
      api_key: { type: 'string' },
      port: { type: 'number', min: 1024, max: 65535 },
      debug: { type: 'boolean' },
    },
  };

  const validConfig = {
    api_key: 'secret_key_12345678',
    port: 3000,
    debug: false,
  };

  const result = validator.validateConfiguration(validConfig, testSchema);
  assert(result.isValid === true, 'valid config returns isValid=true');

  const invalidConfig = { api_key: 'key', port: 80 };
  const invalidResult = validator.validateConfiguration(invalidConfig, testSchema);
  assert(invalidResult.isValid === false, 'invalid config returns isValid=false');
  assert(invalidResult.errors.length > 0, 'invalid config has errors');
});

describe('Schema - Schema Creation', () => {
  const appSchema = schema.createApplicationSchema();
  assert(appSchema.requiredKeys.length > 0, 'app schema has required keys');
  assert(appSchema.rules !== undefined, 'app schema has rules');

  const dbSchema = schema.createDatabaseSchema();
  assert(
    dbSchema.requiredKeys.includes('password'),
    'db schema requires password'
  );

  const authSchema = schema.createAuthSchema();
  assert(
    authSchema.requiredKeys.includes('jwt_secret'),
    'auth schema requires jwt_secret'
  );
});

describe('Schema - Schema Merging', () => {
  const schema1 = {
    requiredKeys: ['key1'],
    optionalKeys: [],
    rules: { key1: { type: 'string' } },
  };

  const schema2 = {
    requiredKeys: ['key2'],
    optionalKeys: [],
    rules: { key2: { type: 'number' } },
  };

  const merged = schema.mergeSchemas(schema1, schema2);
  assert(merged.requiredKeys.includes('key1'), 'merged schema includes key1');
  assert(merged.requiredKeys.includes('key2'), 'merged schema includes key2');
  assert(merged.rules.key1 !== undefined, 'merged schema includes key1 rule');
  assert(merged.rules.key2 !== undefined, 'merged schema includes key2 rule');
});

// ============= TEST RESULTS =============

console.log(`\n${'='.repeat(50)}`);
console.log(`Test Results: ${passCount} passed, ${failCount} failed out of ${testCount}`);
console.log(`${'='.repeat(50)}\n`);

if (failCount > 0) {
  process.exit(1);
}
