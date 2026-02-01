/**
 * Reporter module for formatting and displaying validation results
 */

/**
 * Format a single validation issue for display
 * @param {object} issue - Issue object with key, severity, message, rule
 * @returns {string}
 */
function formatIssue(issue) {
  const severitySymbol = issue.severity === 'ERROR' ? 'ERROR:' : 'WARNING:';
  return `${severitySymbol} ${issue.message} (key: "${issue.key}")`;
}

/**
 * Format the summary line
 * @param {number} errorCount - Number of errors
 * @param {number} warningCount - Number of warnings
 * @returns {string}
 */
function formatSummary(errorCount, warningCount) {
  const parts = [];

  if (errorCount > 0) {
    parts.push(`${errorCount} error${errorCount === 1 ? '' : 's'}`);
  }

  if (warningCount > 0) {
    parts.push(`${warningCount} warning${warningCount === 1 ? '' : 's'}`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No issues found';
}

/**
 * Display validation results to console
 * @param {object} result - Validation result from validator
 * @returns {string} Formatted output
 */
function reportValidation(result) {
  const lines = [];

  // Header
  if (!result.isValid) {
    lines.push('Configuration validation failed:\n');
  } else {
    lines.push('Configuration validation passed.\n');
  }

  // Group issues by severity
  const errors = result.errors || [];
  const warnings = result.warnings || [];

  // Display errors
  if (errors.length > 0) {
    for (const error of errors) {
      lines.push(formatIssue(error));
    }
    if (warnings.length > 0) {
      lines.push('');
    }
  }

  // Display warnings
  if (warnings.length > 0) {
    for (const warning of warnings) {
      lines.push(formatIssue(warning));
    }
  }

  // Summary line
  if (result.issues && result.issues.length > 0) {
    lines.push('');
    lines.push(
      `Summary: ${formatSummary(result.summary.errorCount, result.summary.warningCount)}`
    );
  }

  return lines.join('\n');
}

/**
 * Display validation results with file information
 * @param {object} result - Validation result
 * @param {string} filePath - Path to the validated file
 * @returns {string} Formatted output
 */
function reportValidationWithFile(result, filePath) {
  const lines = [];

  lines.push(`Validating: ${filePath}\n`);
  lines.push(reportValidation(result));

  return lines.join('\n');
}

/**
 * Display validation results as JSON
 * @param {object} result - Validation result
 * @returns {string} JSON formatted output
 */
function reportValidationAsJson(result) {
  return JSON.stringify(result, null, 2);
}

/**
 * Log output to console with optional color
 * @param {string} message - Message to log
 * @param {string} type - Type of message: 'error', 'warn', 'success', 'info'
 */
function log(message, type = 'info') {
  const messages = {
    error: message,
    warn: message,
    success: message,
    info: message,
  };

  console.log(messages[type] || message);
}

/**
 * Create a detailed report for debugging
 * @param {object} result - Validation result
 * @returns {string}
 */
function reportDetailed(result) {
  const lines = [];

  lines.push('=== DETAILED VALIDATION REPORT ===\n');

  lines.push(`Status: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  lines.push(
    `Total Issues: ${result.summary.total}`,
    `Errors: ${result.summary.errorCount}`,
    `Warnings: ${result.summary.warningCount}\n`
  );

  if (result.issues && result.issues.length > 0) {
    lines.push('--- Issues by Type ---\n');

    const groupedByRule = {};
    for (const issue of result.issues) {
      if (!groupedByRule[issue.rule]) {
        groupedByRule[issue.rule] = [];
      }
      groupedByRule[issue.rule].push(issue);
    }

    for (const rule in groupedByRule) {
      lines.push(`${rule}:`);
      for (const issue of groupedByRule[rule]) {
        lines.push(
          `  - [${issue.severity}] ${issue.key}: ${issue.message}`
        );
      }
      lines.push('');
    }
  } else {
    lines.push('No validation issues found.');
  }

  return lines.join('\n');
}

module.exports = {
  formatIssue,
  formatSummary,
  reportValidation,
  reportValidationWithFile,
  reportValidationAsJson,
  reportDetailed,
  log,
};
