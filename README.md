Configuration Validator & Linter

A production-quality command-line tool for validating and linting application configuration files (JSON and .env) to detect common errors and security issues before deployment.

Features

Configuration Format Support
- JSON files (.json)
- Environment files (.env)

Validation Capabilities
- Required key verification
- Unexpected key detection
- Type checking (string, number, boolean, object, array)
- Empty or null value detection
- Value constraints (min/max for numbers, length for strings)
- Enum validation (fixed set of allowed values)
- Custom pattern matching with regular expressions

Security Linting
- Weak password detection (length requirements, common patterns)
- Hardcoded secret identification (passwords, API keys, tokens)
- Unsafe port detection (ports below 1024)
- Public network binding warnings (0.0.0.0, ::)
- Insecure protocol warnings (HTTP vs HTTPS)
- Debug mode in production detection

Output Features
- Clear, human-readable CLI output
- Severity levels: ERROR and WARNING
- Summary statistics showing number of issues found
- JSON output for programmatic parsing
- Detailed reports for debugging

Project Structure

The project follows clean, modular software engineering practices:

js-config-validator/
├── src/
│   ├── cli.js              # CLI entry point and command handling
│   ├── parser.js           # Reads and parses JSON and .env files
│   ├── schema.js           # Configuration schema definitions
│   ├── validator.js        # Core validation engine
│   ├── rules.js            # Security and custom validation rules
│   ├── reporter.js         # CLI output formatting and reporting
│   └── utils.js            # Reusable utility functions
├── examples/
│   ├── valid.config.json       # Example of valid configuration
│   ├── invalid.config.json     # Example of invalid configuration
│   └── example.env             # Example environment file
├── test/
│   └── validator.test.js       # Comprehensive unit tests
├── package.json
└── README.md

Installation

Clone the repository and navigate to the project directory:

git clone <repository-url>
cd js-config-validator
npm install

Running Tests

Execute the unit test suite to verify the installation:

npm test

This runs 60+ unit tests covering all major components and validation rules.

Usage

Basic Validation

Validate a configuration file with the default application schema:

node src/cli.js validate <filepath>

Examples:

node src/cli.js validate config.json
node src/cli.js validate .env
node src/cli.js validate config/database.json

Schema Selection

Specify which configuration schema to use:

node src/cli.js validate <filepath> --schema <schema-name>

Available schemas: application, database, auth

Examples:

node src/cli.js validate config.json --schema application
node src/cli.js validate db-config.json --schema database
node src/cli.js validate auth-config.json --schema auth

Output Formats

Standard human-readable output (default):

node src/cli.js validate config.json

JSON output for programmatic parsing:

node src/cli.js validate config.json --json

Detailed validation report:

node src/cli.js validate config.json --detailed

Help and Usage Information

node src/cli.js --help

Exit Codes

- 0: Validation passed (no errors)
- 1: Validation failed (errors or unknown command/schema)

Example Scenarios

Validating Development Configuration

node src/cli.js validate config.dev.json

Output (if valid):
Configuration validation passed.

Validating Production Configuration with Errors

node src/cli.js validate config.prod.json

Output (if invalid):
Validating: config.prod.json

Configuration validation failed:

ERROR: Missing required key "database_url"
ERROR: Invalid type for "port" (expected number)
ERROR: Unsafe port 80. Ports below 1024 require elevated privileges.
WARNING: Weak password detected: Password length less than 8 characters
WARNING: Hardcoded secret detected. Use environment variables instead.

Summary: 3 errors, 2 warnings

Validating Environment Configuration

node src/cli.js validate .env --schema application

JSON Output for CI/CD Integration

node src/cli.js validate config.json --json

Outputs structured JSON that can be parsed by CI/CD pipelines.

Configuration Schema Examples

Application Schema

Required keys: app_name, environment, database_url, port, api_key
Optional keys: debug, log_level, cache_enabled, description

Example valid config:

{
  "app_name": "MyApplication",
  "environment": "production",
  "database_url": "postgresql://user:pass@db.example.com:5432/myapp",
  "port": 3000,
  "api_key": "sk_live_abcdef123456",
  "debug": false,
  "log_level": "info"
}

Database Schema

Required keys: host, port, database, user, password
Optional keys: ssl, pool_size, timeout

Example:

{
  "host": "db.example.com",
  "port": 5432,
  "database": "production",
  "user": "app_user",
  "password": "secure_password_123",
  "ssl": true,
  "pool_size": 20
}

Authentication Schema

Required keys: jwt_secret, session_timeout
Optional keys: password_hash_rounds, mfa_enabled, oauth_provider

Example:

{
  "jwt_secret": "your_long_secret_key_32_chars_min",
  "session_timeout": 3600,
  "password_hash_rounds": 12,
  "mfa_enabled": true,
  "oauth_provider": "google"
}

Validation Rules

Type Validation

Rules support the following types:
- string: Text values
- number: Numeric values (integers and decimals)
- boolean: true or false
- object: Nested objects
- array: Lists of values

String Constraints

- notEmpty: Value must not be empty or whitespace
- minLength: Minimum character count
- maxLength: Maximum character count
- pattern: Regular expression that value must match
- enum: Fixed set of allowed values

Number Constraints

- min: Minimum allowed value (inclusive)
- max: Maximum allowed value (inclusive)
- enum: Fixed set of allowed values

Security Rules

The tool automatically applies security rules to detect:

Weak Passwords
- Password length less than 8 characters
- Common weak passwords (password, 123456, qwerty, etc.)

Hardcoded Secrets
- Hardcoded passwords, API keys, tokens, or private keys
- Keys detected by naming patterns: password, secret, token, api_key, auth, etc.
- Use environment variable syntax (${VAR_NAME}) to avoid warnings

Unsafe Ports
- Ports below 1024 (require elevated privileges)
- Exception: localhost (127.0.0.1) bindings

Public Network Bindings
- Binding to 0.0.0.0 (all interfaces)
- Binding to :: (IPv6 all interfaces)

Insecure Protocols
- HTTP URLs (except localhost)
- Recommendation: Use HTTPS for remote connections

Why This Tool Is Useful

Configuration Management Challenges

Modern applications rely on configuration files for environment-specific settings. Managing these files safely is critical because:

Security Risks
- Hardcoded secrets in version control
- Weak passwords that don't meet security standards
- Unsafe network bindings exposing services to the internet
- Debug modes accidentally left enabled in production

Operational Issues
- Missing required configuration keys
- Type mismatches between configuration and code
- Values outside acceptable ranges (ports, timeouts, pool sizes)
- Inconsistent configuration formats

Development Workflow
- Developers might use development configuration in production
- Manual validation is error-prone and time-consuming
- No standardized configuration structure across teams
- Difficult to enforce security policies

Real-World Use Cases

Pre-Deployment Validation
Add configuration validation to your deployment pipeline to catch errors before they reach production:

npm run validate:config && npm start

Local Development
Validate configuration files during development to catch issues early:

node src/cli.js validate config.local.json --detailed

CI/CD Integration
Integrate validation into GitHub Actions, GitLab CI, or other CI/CD systems:

npm test
npm run validate:config

Docker Container Startup
Validate configuration in Docker entrypoint scripts before starting the application:

#!/bin/bash
node src/cli.js validate config.json || exit 1
node app.js

Configuration Review
Use the tool to review and validate configuration changes in pull requests before merging.

Architecture and Design

Module Organization

cli.js
Entry point for the command-line interface. Handles argument parsing, file resolution, and orchestration of other modules.

parser.js
Reads and parses configuration files. Supports JSON files and .env format. Provides unified interface for both formats.

schema.js
Defines configuration schemas. Includes predefined schemas (application, database, auth) and utilities for schema management (merging, composition).

validator.js
Core validation engine. Implements schema validation, type checking, constraint validation, and security rule application.

rules.js
Security and custom validation rules. Each rule is independently testable and can be enabled/disabled.

reporter.js
Formats and displays validation results. Supports multiple output formats (text, JSON, detailed reports).

utils.js
Reusable utility functions for type checking, password validation, pattern matching, and common operations.

Design Patterns

Single Responsibility Principle
Each module has a clear, focused purpose.

Separation of Concerns
Validation logic, security rules, and output formatting are independent.

Extensibility
New schemas and rules can be added without modifying existing code.

Testability
All functions are pure and independently testable (no global state).

Error Handling
Clear error messages help users quickly identify and fix configuration issues.

Performance

The tool is optimized for fast validation:
- Single-pass validation for efficiency
- Minimal memory overhead
- No external dependencies (uses Node.js standard library)
- Suitable for CI/CD pipelines with strict time constraints

Testing

Comprehensive Test Coverage

The test suite includes 60+ unit tests covering:

Utility Functions
- Type detection and conversion
- Empty value checking
- Password strength validation
- Pattern matching and regex support
- Email and URL validation
- Range checking

Validation Rules
- Type validation
- String constraints (length, pattern, enum)
- Number constraints (min/max, enum)
- Boolean validation

Security Rules
- Weak password detection
- Hardcoded secret detection
- Unsafe port detection
- Public binding detection
- Insecure protocol detection
- Debug in production detection

Schema Validation
- Required key detection
- Unexpected key detection
- Value constraint validation
- Schema merging and composition

Run Tests

npm test

Expected Output

Test Results: 60+ passed, 0 failed out of 60+

Adding Custom Schemas

Create custom schemas for your application's specific needs:

const schema = require('./src/schema');

const customSchema = {
  requiredKeys: ['service_name', 'replicas', 'memory_limit'],
  optionalKeys: ['cpu_limit', 'storage'],
  rules: {
    service_name: {
      type: 'string',
      notEmpty: true,
      minLength: 3,
      maxLength: 50
    },
    replicas: {
      type: 'number',
      min: 1,
      max: 100
    },
    memory_limit: {
      type: 'string',
      pattern: '^\\d+(Mi|Gi|Ki)$'  // Kubernetes format
    }
  }
};

Using the customSchema with validation:

const validator = require('./src/validator');
const result = validator.validateConfiguration(config, customSchema);

Adding Custom Rules

Extend the rules module to add application-specific security checks:

function checkCustomRule(key, value, fullConfig) {
  if (key === 'database_pool_size' && value > 100) {
    return {
      key,
      severity: 'WARNING',
      message: 'Database pool size exceeds recommended limit',
      rule: 'high_pool_size'
    };
  }
  return null;
}

Contributing

The project follows clean code principles and maintains a high standard of code quality:

Code Style
- Consistent indentation and formatting
- Descriptive variable and function names
- Comprehensive comments and documentation

Testing
- All new features must include unit tests
- Tests should cover both happy paths and edge cases
- Run npm test before submitting changes

Version Control
- Meaningful commit messages
- Feature branches for new work
- Pull requests for code review

Compatibility

- Node.js 12 or higher
- Works on Windows, macOS, and Linux
- Supports UTF-8 encoded configuration files
- Compatible with most CI/CD platforms

Future Enhancements

Potential improvements and features for future releases:

- YAML file format support
- TOML configuration format
- Custom rule plugins system
- Configuration file generation and templates
- Integration with secret management systems (Vault, Secrets Manager)
- Watch mode for automatic validation on file changes
- Performance profiling and optimization
- Graphical configuration editor

License

MIT License. See LICENSE file for details.

Support

For issues, questions, or feature requests, please open an issue on the project repository.

Changelog

Version 1.0.0 - Initial Release

- Complete JSON and .env file validation
- Predefined schemas (application, database, authentication)
- Comprehensive security linting rules
- Multi-format output (text, JSON, detailed reports)
- 60+ unit tests with full coverage
- Command-line interface with help documentation
