# Architecture

## Module Overview

```
cli.js
  ├── parser.js (file I/O)
  ├── validator.js (validation logic)
  ├── schema.js (schemas)
  ├── reporter.js (output)
  └── utils.js (helpers)

validator.js
  ├── rules.js (security rules)
  └── utils.js

rules.js
  └── utils.js
```

## Module Descriptions

**cli.js** - Command-line interface  
- Argument parsing
- File resolution
- Command dispatch

**parser.js** - File parsing  
- JSON files
- .env files
- Format detection

**validator.js** - Validation engine  
- Type checking
- Constraint validation
- Schema validation

**rules.js** - Security rules  
- Weak passwords
- Hardcoded secrets
- Unsafe ports
- Public bindings
- Insecure protocols
- Debug in production

**schema.js** - Schema definitions  
- Application schema
- Database schema
- Auth schema
- Schema merging

**reporter.js** - Output formatting  
- Text output
- JSON output
- Detailed reports

**utils.js** - Utility functions  
- Type detection
- Password validation
- Email/URL validation
- Pattern matching

## Data Structures

**Issue Object:**
```javascript
{
  key: string,
  severity: 'ERROR' | 'WARNING',
  message: string,
  rule: string
}
```

**Validation Result:**
```javascript
{
  isValid: boolean,
  issues: array,
  errors: array,
  warnings: array,
  summary: {
    total: number,
    errorCount: number,
    warningCount: number
  }
}
```

**Schema:**
```javascript
{
  requiredKeys: array,
  optionalKeys: array,
  rules: {
    keyName: {
      type: string,
      notEmpty: boolean,
      minLength: number,
      maxLength: number,
      pattern: regex,
      enum: array,
      min: number,
      max: number
    }
  }
}
```

## Design Patterns

**Single Responsibility** - Each module does one thing  
**Separation of Concerns** - Logic, rules, output are independent  
**Pure Functions** - No side effects, no global state  
**Extensibility** - Easy to add schemas and rules

## Code Quality

- No external dependencies
- Modern ES6+ JavaScript
- Comprehensive error handling
- Well-commented code
- 74 unit tests (100% pass rate)

## Performance

- Sub-second validation
- Linear time complexity O(n + k)
- Minimal memory usage
- Suitable for CI/CD pipelines
