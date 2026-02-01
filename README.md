# Configuration Validator & Linter

A command-line tool for validating and linting JSON and .env configuration files. Detects common errors and security issues before deployment.

## Features

- **Type checking** - Verify data types for all configuration values
- **Value constraints** - Set min/max values, string length, and enum options
- **Required keys** - Ensure mandatory configuration fields are present
- **Security checks** - Detect weak passwords, hardcoded secrets, unsafe ports
- **Multiple formats** - Support for JSON and .env files
- **Flexible output** - Human-readable text, JSON, or detailed reports

## Installation

```bash
npm install
npm test    # Verify installation (74 tests)
```

## Quick Start

Validate a config file:

```bash
node src/cli.js validate config.json
```

With a specific schema:

```bash
node src/cli.js validate config.json --schema database
```

JSON output (for CI/CD):

```bash
node src/cli.js validate config.json --json
```

## Commands

```
node src/cli.js validate <file>                     # Default schema
node src/cli.js validate <file> --schema <name>     # application, database, or auth
node src/cli.js validate <file> --json              # JSON output
node src/cli.js validate <file> --detailed          # Diagnostic report
node src/cli.js --help                              # Show help
```

Exit codes: `0` (success) or `1` (validation failed)

## Schemas

### Application

Required: `app_name`, `environment`, `database_url`, `port`, `api_key`

```json
{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "postgresql://db.example.com/myapp",
  "port": 3000,
  "api_key": "sk_live_..."
}
```

### Database

Required: `host`, `port`, `database`, `user`, `password`

```json
{
  "host": "db.example.com",
  "port": 5432,
  "database": "production",
  "user": "app_user",
  "password": "secure_password"
}
```

### Authentication

Required: `jwt_secret`, `session_timeout`

```json
{
  "jwt_secret": "your_long_secret_key_32_chars_minimum",
  "session_timeout": 3600
}
```

## Validation Rules

**Type checking**: string, number, boolean, object, array

**String constraints**: minLength, maxLength, pattern, enum, notEmpty

**Number constraints**: min, max, enum

**Security checks**:
- Weak passwords (< 8 characters or common patterns)
- Hardcoded secrets (password, api_key, token, etc.)
- Unsafe ports (< 1024)
- Public bindings (0.0.0.0, ::)
- Insecure protocols (HTTP)
- Debug in production

## Examples

Valid config:

```bash
node src/cli.js validate examples/valid.config.json
```

Invalid config (shows errors):

```bash
node src/cli.js validate examples/invalid.config.json
```

## Best Practices

**Use environment variables for secrets**:

```json
{
  "api_key": "${API_KEY}"
}
```

**Use safe ports** (3000, 5000, 8080, etc.)

**Disable debug in production**:

```json
{
  "environment": "production",
  "debug": false
}
```

## Integration

### NPM Script

```json
{
  "scripts": {
    "validate": "node src/cli.js validate config.json"
  }
}
```

### Pre-commit Hook

```bash
#!/bin/bash
node src/cli.js validate config.json || exit 1
```

### GitHub Actions

```yaml
- name: Validate Config
  run: node src/cli.js validate config.json
```

### Docker

```dockerfile
RUN node src/cli.js validate config.json || exit 1
```

## Testing

```bash
npm test
```

Result: 74 tests passing

## Custom Schemas

```javascript
const schema = {
  requiredKeys: ['name', 'port'],
  optionalKeys: ['debug'],
  rules: {
    name: { type: 'string', notEmpty: true },
    port: { type: 'number', min: 1024, max: 65535 },
    debug: { type: 'boolean' }
  }
};

const result = validator.validateConfiguration(config, schema);
```

## Project Structure

```
src/
  cli.js       - Command-line interface
  parser.js    - JSON and .env parsing
  validator.js - Validation engine
  rules.js     - Security rules
  schema.js    - Schema definitions
  reporter.js  - Output formatting
  utils.js     - Helpers

examples/
  valid.config.json
  invalid.config.json
  example.env

test/
  validator.test.js (74 tests)
```

## Compatibility

- Node.js 12+
- Windows, macOS, Linux
- UTF-8 files

## License

MIT
