Configuration Validator & Linter - Usage Examples

Complete Examples and Demonstrations

Basic Usage Examples

Example 1: Validating a Simple Configuration File

Create a configuration file (app.config.json):

{
  "app_name": "MyApplication",
  "environment": "staging",
  "database_url": "postgresql://db.example.com:5432/myapp",
  "port": 3000,
  "api_key": "staging_key_abc123xyz"
}

Run validation:

node src/cli.js validate app.config.json

Output:

Reading configuration from: app.config.json
Validating: app.config.json

Configuration validation passed.

WARNING: Hardcoded secret detected. Use environment variables instead.
 (key: "api_key")

Summary: 1 warning

Example 2: Detecting Missing Required Keys

Create a minimal config (incomplete.config.json):

{
  "app_name": "MyApp"
}

Run validation:

node src/cli.js validate incomplete.config.json

Output:

Configuration validation failed:

ERROR: Missing required key (key: "environment")
ERROR: Missing required key (key: "database_url")
ERROR: Missing required key (key: "port")
ERROR: Missing required key (key: "api_key")

Summary: 4 errors

Example 3: Type Validation Errors

Create a config with wrong types (types.config.json):

{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "postgresql://localhost/db",
  "port": "3000",
  "api_key": 12345
}

Run validation:

node src/cli.js validate types.config.json

Output:

Configuration validation failed:

ERROR: Invalid type 'string', expected 'number' (key: "port")
ERROR: Invalid type 'number', expected 'string' (key: "api_key")

Summary: 2 errors

Example 4: Security Issues Detection

Create a risky config (security.config.json):

{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "http://db.example.com:5432/myapp",
  "port": 80,
  "api_key": "password",
  "debug": true,
  "admin_password": "123456"
}

Run validation:

node src/cli.js validate security.config.json

Output:

Configuration validation failed:

ERROR: Unsafe port 80. Ports below 1024 require elevated privileges.
ERROR: Debug mode enabled in production environment.
ERROR: Weak password detected: Password length less than 8 characters

WARNING: Insecure HTTP protocol used. Consider using HTTPS.
WARNING: Weak password detected: Password length less than 8 characters

Summary: 3 errors, 2 warnings

Working with Environment Files

Example 5: Validating .env Files

Create .env file (.env.production):

APP_NAME=Production App
ENVIRONMENT=production
DATABASE_URL=postgresql://prod-db:5432/myapp
PORT=3000
API_KEY=sk_prod_secret_key_12345

Run validation:

node src/cli.js validate .env.production

Note: .env format uses uppercase keys, which differ from the application schema. Use case-matching or create a custom schema if needed.

Example 6: Multiple Configuration Files

Validate different environment configs:

node src/cli.js validate config.dev.json
node src/cli.js validate config.staging.json
node src/cli.js validate config.prod.json

Or use npm scripts:

npm run validate:dev
npm run validate:staging
npm run validate:prod

Schema Selection Examples

Example 7: Database Configuration

Create database config (db.config.json):

{
  "host": "db.production.example.com",
  "port": 5432,
  "database": "production_db",
  "user": "app_user",
  "password": "SecurePassword123!",
  "ssl": true,
  "pool_size": 20,
  "timeout": 5000
}

Run with database schema:

node src/cli.js validate db.config.json --schema database

Output:

Configuration validation passed.

Summary: No issues found

Example 8: Authentication Configuration

Create auth config (auth.config.json):

{
  "jwt_secret": "your_very_long_secret_key_minimum_32_chars_required",
  "session_timeout": 3600,
  "password_hash_rounds": 12,
  "mfa_enabled": true,
  "oauth_provider": "google"
}

Run with auth schema:

node src/cli.js validate auth.config.json --schema auth

Output:

Configuration validation passed.

Summary: No issues found

Output Format Examples

Example 9: JSON Output for CI/CD Integration

Run with --json flag:

node src/cli.js validate config.json --json

Output (formatted):

{
  "isValid": false,
  "issues": [
    {
      "key": "port",
      "severity": "ERROR",
      "message": "Value is 80, minimum is 1024",
      "rule": "validation_error"
    },
    {
      "key": "api_key",
      "severity": "WARNING",
      "message": "Hardcoded secret detected",
      "rule": "hardcoded_secret"
    }
  ],
  "errors": [...],
  "warnings": [...],
  "summary": {
    "total": 5,
    "errorCount": 3,
    "warningCount": 2
  }
}

This JSON output can be parsed by CI/CD systems for:
- Conditional execution
- Report generation
- Dashboard updates
- Automated remediation

Example 10: Detailed Report Output

Run with --detailed flag:

node src/cli.js validate config.json --detailed

Output:

=== DETAILED VALIDATION REPORT ===

Status: FAILED
Total Issues: 4
Errors: 2
Warnings: 2

--- Issues by Type ---

missing_required_key:
  - [ERROR] database_url: Missing required key
  - [ERROR] api_key: Missing required key

validation_error:
  - [ERROR] port: Value is 80, minimum is 1024

hardcoded_secret:
  - [WARNING] admin_password: Hardcoded secret detected

insecure_protocol:
  - [WARNING] database_url: Insecure HTTP protocol used

Advanced Usage Scenarios

Example 11: Pre-Commit Hook Validation

Create .git/hooks/pre-commit:

#!/bin/bash
echo "Validating configuration files..."
node src/cli.js validate config.json || exit 1
node src/cli.js validate .env || exit 1
echo "Configuration validation passed!"

Example 12: GitHub Actions Workflow

Create .github/workflows/validate-config.yml:

name: Validate Configuration

on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm test
      - run: node src/cli.js validate config.json
      - run: node src/cli.js validate .env --schema application

Example 13: Docker Build Validation

Create Dockerfile:

FROM node:16
WORKDIR /app
COPY . .
RUN npm install
RUN npm test
RUN node src/cli.js validate config.json || exit 1
CMD ["npm", "start"]

Example 14: Custom Schema in Code

Using the validator programmatically:

const validator = require('./src/validator');
const parser = require('./src/parser');
const schema = require('./src/schema');

// Custom schema
const customSchema = {
  requiredKeys: ['service_name', 'image', 'port'],
  optionalKeys: ['replicas', 'resources'],
  rules: {
    service_name: { type: 'string', notEmpty: true },
    image: { type: 'string', pattern: '^[a-z0-9]+/[a-z0-9]+:[a-z0-9.]+$' },
    port: { type: 'number', min: 1024, max: 65535 },
    replicas: { type: 'number', min: 1, max: 100 }
  }
};

// Validate
const { data } = await parser.parseConfigFile('service-config.json');
const result = validator.validateConfiguration(data, customSchema);

console.log(result.isValid ? 'Valid' : 'Invalid');

Example 15: Merging Schemas

Combine multiple schema definitions:

const appSchema = schema.createApplicationSchema();
const dbSchema = schema.createDatabaseSchema();
const authSchema = schema.createAuthSchema();

const combined = schema.mergeSchemas(appSchema, dbSchema, authSchema);

const result = validator.validateConfiguration(config, combined);

Real-World Scenarios

Scenario 1: Development Team Configuration Review

Developer opens a PR with new configuration. CI/CD runs:

npm test && node src/cli.js validate config.json --json

If validation fails, the JSON output is parsed and commented on the PR with specific issues.

Scenario 2: Production Deployment Checklist

Before deploying:

node src/cli.js validate config.prod.json --detailed

Review the detailed report and check:
- No hardcoded secrets
- Correct port (not below 1024)
- Debug disabled
- All required keys present
- Environment set to 'production'

Scenario 3: Configuration Migration

Migrating from old to new config format:

Old format parsing → validation with both schemas → migration script → new format validation

node src/cli.js validate old-config.json
node src/cli.js validate new-config.json

Both must pass before migration is complete.

Scenario 4: Multi-Environment Setup

Separate configs for each environment:

Development:
node src/cli.js validate config.dev.json --detailed

Staging:
node src/cli.js validate config.staging.json --detailed

Production:
node src/cli.js validate config.prod.json --detailed

Each validates against the same schema with environment-specific rules.

Scenario 5: Configuration Documentation

Generate a configuration template from schema:

const appSchema = schema.createApplicationSchema();
console.log(JSON.stringify(appSchema, null, 2));

Output shows all required/optional keys and their validation rules.

Common Patterns

Pattern 1: Safe Configuration with Environment Variables

{
  "app_name": "MyApp",
  "environment": "${NODE_ENV}",
  "database_url": "${DATABASE_URL}",
  "api_key": "${API_KEY}"
}

Pattern 2: Configuration with Fallback Values

const config = {
  ...userConfig,
  port: userConfig.port || 3000,
  debug: userConfig.debug || false
};

Pattern 3: Configuration Composition

const baseConfig = schema.createApplicationSchema();
const customRules = { custom_field: { type: 'string' } };
const finalSchema = { ...baseConfig, rules: { ...baseConfig.rules, ...customRules } };

Pattern 4: Conditional Validation

const result = validator.validateConfiguration(config, schema);
if (result.errors.length > 0) {
  // Critical errors - stop
  process.exit(1);
}
if (result.warnings.length > 0) {
  // Warnings - log but continue
  console.warn('Configuration warnings:');
  result.warnings.forEach(w => console.warn(`  ${w.message}`));
}

Troubleshooting Examples

Example: File Not Found

node src/cli.js validate nonexistent.json

Error: File not found: nonexistent.json

Fix: Check the file exists and path is correct.

Example: Invalid JSON

node src/cli.js validate bad.json

Error: Invalid JSON format: Unexpected token...

Fix: Validate JSON syntax with a JSON linter.

Example: Unknown Schema

node src/cli.js validate config.json --schema custom

Error: Unknown schema "custom"

Fix: Use available schemas: application, database, auth

Example: Port Validation

{
  "port": 80
}

Output: ERROR: Unsafe port 80...

Fix: Use a port above 1024 (e.g., 3000, 5000, 8000, 8080).

Performance Examples

Example: Validating Large Configuration Files

The tool is optimized for large configs:

node src/cli.js validate large-config.json

Handles thousands of configuration keys efficiently.

Example: Batch Validation

Validate multiple files:

for file in config/*.json; do
  node src/cli.js validate "$file" || exit 1
done

Example: CI/CD Integration Performance

Validation runs in milliseconds, suitable for CI/CD pipelines that require strict time constraints.

Conclusion

These examples demonstrate the flexibility and power of the Configuration Validator & Linter for:
- Development workflows
- CI/CD integration
- Security enforcement
- Configuration management
- Team collaboration
- Production readiness

For more information, see the full README.md and QUICKSTART.md documentation.
