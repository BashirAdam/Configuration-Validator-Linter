Configuration Validator & Linter - Quick Start Guide

Getting Started in 5 Minutes

Step 1: Run the Tests

First, verify that everything is working correctly by running the comprehensive test suite:

npm test

You should see: Test Results: 74 passed, 0 failed

Step 2: Validate Example Files

Try validating the included example files to see the tool in action.

Valid Configuration:

npm run validate:valid

This should pass with a warning about hardcoded secrets.

Invalid Configuration:

npm run validate:invalid

This demonstrates error detection with multiple validation and security issues.

Environment File:

npm run validate:env

This validates a .env format configuration file.

Step 3: Validate Your Own Configuration

Create your configuration file and validate it:

node src/cli.js validate path/to/your/config.json

Step 4: Try Different Output Formats

JSON output for programmatic parsing:

node src/cli.js validate config.json --json

Detailed report for debugging:

node src/cli.js validate config.json --detailed

Step 5: Use Different Schemas

The tool includes predefined schemas. Select the appropriate one for your configuration:

For application configuration:

node src/cli.js validate config.json --schema application

For database configuration:

node src/cli.js validate db-config.json --schema database

For authentication configuration:

node src/cli.js validate auth-config.json --schema auth

Common Commands Reference

Display help:

node src/cli.js --help

Validate JSON file with default schema:

node src/cli.js validate config.json

Validate .env file:

node src/cli.js validate .env

Validate with specific schema:

node src/cli.js validate config.json --schema database

Get JSON output:

node src/cli.js validate config.json --json

Get detailed report:

node src/cli.js validate config.json --detailed

Run all example validations:

npm run validate:all

Run tests:

npm test

Project Structure Overview

src/
- cli.js: Command-line interface and entry point
- parser.js: Reads JSON and .env files
- validator.js: Core validation engine
- rules.js: Security linting rules
- schema.js: Configuration schemas
- reporter.js: Output formatting
- utils.js: Utility functions

examples/
- valid.config.json: Example of valid configuration
- invalid.config.json: Example of invalid configuration
- example.env: Example environment file

test/
- validator.test.js: Comprehensive unit tests (74 tests)

Understanding the Output

Passing Validation

Configuration validation passed.

No issues found - configuration is valid.

Failed Validation

Configuration validation failed:

ERROR: Missing required key (key: "database_url")
ERROR: Unsafe port 80. Ports below 1024 require elevated privileges.
WARNING: Weak password detected (key: "admin_password")

Summary: 2 errors, 1 warning

The tool identifies the severity level, describes the issue, and shows which key is affected.

JSON Output

Use --json flag for programmatic parsing:

{
  "isValid": false,
  "issues": [...],
  "errors": [...],
  "warnings": [...],
  "summary": {
    "total": 3,
    "errorCount": 2,
    "warningCount": 1
  }
}

Creating Your First Configuration

Start with the application schema:

{
  "app_name": "MyApp",
  "environment": "development",
  "database_url": "postgresql://localhost:5432/myapp",
  "port": 3000,
  "api_key": "dev_key_abc123"
}

Validate it:

node src/cli.js validate my-config.json

Configuration File Best Practices

Use Environment Variables for Secrets

Instead of hardcoding secrets:

{
  "api_key": "${API_KEY}"
}

Reference the variable in your .env:

API_KEY=sk_live_your_actual_key

Use Secure Port Numbers

Avoid ports below 1024 (they require elevated privileges):

{
  "port": 3000
}

Not:

{
  "port": 80
}

Enable Debug Only in Development

Disable debug mode in production:

{
  "environment": "production",
  "debug": false
}

Avoid Hardcoded Credentials

Use placeholders or environment variables:

Good:
{
  "database_password": "${DB_PASSWORD}"
}

Bad:
{
  "database_password": "MySecurePassword123"
}

Security Checklist

Before deploying, ensure your configuration:

- Includes all required keys
- Uses correct data types
- Has values within specified ranges
- Does not have hardcoded secrets
- Does not use weak passwords
- Does not enable debug in production
- Does not use unsafe ports (below 1024)
- Does not bind to public interfaces (0.0.0.0) unless intentional

Troubleshooting

File Not Found

Error: File not found: config.json

Make sure the file path is correct and the file exists:

node src/cli.js validate ./config.json

Invalid JSON

Error: Invalid JSON format

Verify your JSON file has correct syntax:

{
  "key": "value"
}

Unknown Schema

Error: Unknown schema "myschema"

Use one of the available schemas: application, database, auth

node src/cli.js validate config.json --schema application

No Issues Found But Tool Fails

If the tool reports "passed" but exits with code 1:

- Check if there are warnings (not errors)
- Add --json flag to see detailed output
- Use --detailed for a report organized by rule type

Integration Examples

GitHub Actions

- name: Validate configuration
  run: npm test && node src/cli.js validate config.json

Docker Build

COPY . /app
WORKDIR /app
RUN npm install
RUN node src/cli.js validate config.json || exit 1

NPM Scripts

{
  "scripts": {
    "validate": "node src/cli.js validate config.json",
    "validate:all": "npm run validate && npm test"
  }
}

Next Steps

1. Run npm test to verify the installation
2. Validate the example files to understand the tool's capabilities
3. Create a schema that matches your application's needs
4. Validate your configuration files
5. Integrate the tool into your development workflow
6. Add validation to your CI/CD pipeline

For More Information

See README.md for comprehensive documentation about:
- All validation features
- Security linting rules
- Custom schemas
- Custom rules
- Architecture details
- Testing examples
