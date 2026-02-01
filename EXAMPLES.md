# Examples

## Basic Validation

```bash
node src/cli.js validate config.json
```

With schema:

```bash
node src/cli.js validate config.json --schema database
```

JSON output:

```bash
node src/cli.js validate config.json --json
```

## Configuration Examples

### Application Config (valid)

```json
{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "postgresql://db.example.com/myapp",
  "port": 3000,
  "api_key": "${API_KEY}"
}
```

### Application Config (invalid)

```json
{
  "app_name": "MyApp",
  "port": "3000",
  "api_key": 123
}
```

Issues:
- Missing required keys (environment, database_url)
- Wrong type for port (string instead of number)
- Wrong type for api_key (number instead of string)

### Database Config

```json
{
  "host": "db.example.com",
  "port": 5432,
  "database": "production",
  "user": "app_user",
  "password": "${DB_PASSWORD}",
  "ssl": true,
  "pool_size": 20
}
```

### Authentication Config

```json
{
  "jwt_secret": "your_long_secret_key_minimum_32_characters",
  "session_timeout": 3600,
  "mfa_enabled": true
}
```

## Error Examples

### Missing Keys

Config:
```json
{ "app_name": "MyApp" }
```

Output:
```
ERROR: Missing required key (key: "environment")
ERROR: Missing required key (key: "database_url")
ERROR: Missing required key (key: "port")
ERROR: Missing required key (key: "api_key")
```

### Type Errors

Config:
```json
{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "postgresql://localhost/db",
  "port": "3000",
  "api_key": 12345
}
```

Output:
```
ERROR: Invalid type 'string', expected 'number' (key: "port")
ERROR: Invalid type 'number', expected 'string' (key: "api_key")
```

### Security Issues

Config:
```json
{
  "app_name": "MyApp",
  "environment": "production",
  "database_url": "http://db.example.com/myapp",
  "port": 80,
  "api_key": "password",
  "admin_password": "123456",
  "debug": true
}
```

Output:
```
ERROR: Unsafe port 80. Ports below 1024 require elevated privileges.
ERROR: Debug mode enabled in production environment.
ERROR: Weak password detected: Password length less than 8 characters

WARNING: Insecure HTTP protocol used. Consider using HTTPS.
WARNING: Weak password detected for admin_password
WARNING: Hardcoded secret detected for api_key
```

## Integration Examples

### Pre-commit Hook

```bash
#!/bin/bash
node src/cli.js validate config.json || exit 1
```

### GitHub Actions

```yaml
- name: Validate Configuration
  run: |
    npm test
    node src/cli.js validate config.json
```

### Docker

```dockerfile
RUN node src/cli.js validate config.json || exit 1
```

### NPM Script

```json
{
  "scripts": {
    "validate": "node src/cli.js validate config.json",
    "prestart": "npm run validate"
  }
}
```

## Best Practices

**Use environment variables:**
```json
{ "api_key": "${API_KEY}" }
```

**Safe ports:**
```json
{ "port": 3000 }
```

**Disable debug in production:**
```json
{ "environment": "production", "debug": false }
```

**Strong passwords (8+ characters):**
```json
{ "admin_password": "SecurePass123!" }
```
