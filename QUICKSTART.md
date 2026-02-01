# Quick Start Guide

## Setup (2 minutes)

```bash
npm install
npm test
```

Expected: 74 tests passing

## Try Examples (2 minutes)

Valid configuration:

```bash
npm run validate:valid
```

Invalid configuration:

```bash
npm run validate:invalid
```

Environment file:

```bash
npm run validate:env
```

## Basic Usage

Validate your config:

```bash
node src/cli.js validate config.json
```

Choose a schema:

```bash
node src/cli.js validate config.json --schema database
```

JSON output:

```bash
node src/cli.js validate config.json --json
```

## Configuration Example

```json
{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "postgresql://db.example.com/myapp",
  "port": 3000,
  "api_key": "${API_KEY}"
}
```

Use `${VARIABLE_NAME}` for secrets instead of hardcoding.

## Best Practices

- Use ports > 1024 (e.g., 3000, 5000, 8080)
- Disable debug in production
- Use environment variables for secrets
- Validate before deployment

## Troubleshooting

**File not found** - Check the file path exists

**Invalid JSON** - Use a JSON linter to check syntax

**Weak password** - Use 8+ characters

**Hardcoded secret** - Use `${SECRET_NAME}` instead

## Integration

### NPM Script

```json
{
  "scripts": {
    "validate": "node src/cli.js validate config.json"
  }
}
```

### GitHub Actions

```yaml
- name: Validate Config
  run: npm test && node src/cli.js validate config.json
```

### Docker

```dockerfile
RUN node src/cli.js validate config.json || exit 1
```

## Learn More

- **README.md** - Full documentation
- **EXAMPLES.md** - Real-world scenarios
- **ARCHITECTURE.md** - Code structure
- All validation features
- Security linting rules
- Custom schemas
- Custom rules
- Architecture details
- Testing examples
