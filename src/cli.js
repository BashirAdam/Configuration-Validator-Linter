#!/usr/bin/env node

/**
 * CLI entry point for the Configuration Validator & Linter
 * Usage: node src/cli.js validate <filepath> [--schema <schema-name>] [--json]
 */

const path = require('path');
const parser = require('./parser');
const validator = require('./validator');
const reporter = require('./reporter');
const schema = require('./schema');

/**
 * Print usage information
 */
function printUsage() {
  console.log(`
Configuration Validator & Linter

Usage:
  node src/cli.js validate <filepath> [options]

Options:
  --schema <name>     Schema to use: application, database, auth (default: application)
  --json              Output results as JSON
  --detailed          Show detailed report
  --help              Show this help message

Examples:
  node src/cli.js validate config.json
  node src/cli.js validate .env --schema application
  node src/cli.js validate config.json --json
  node src/cli.js validate config.json --detailed
`);
}

/**
 * Parse command line arguments
 * @returns {object}
 */
function parseArguments(args) {
  const result = {
    command: null,
    filePath: null,
    schemaName: 'application',
    json: false,
    detailed: false,
    help: false,
  };

  let i = 2; // Skip 'node' and 'cli.js'

  if (args[i] === '--help' || args[i] === '-h') {
    result.help = true;
    return result;
  }

  if (args[i]) {
    result.command = args[i];
    i++;
  }

  if (args[i]) {
    result.filePath = args[i];
    i++;
  }

  // Parse remaining options
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--schema' && args[i + 1]) {
      result.schemaName = args[i + 1];
      i += 2;
    } else if (arg === '--json') {
      result.json = true;
      i++;
    } else if (arg === '--detailed') {
      result.detailed = true;
      i++;
    } else if (arg === '--help' || arg === '-h') {
      result.help = true;
      i++;
    } else {
      i++;
    }
  }

  return result;
}

/**
 * Resolve file path to absolute path
 * @param {string} filePath - File path (relative or absolute)
 * @returns {string}
 */
function resolveFilePath(filePath) {
  if (path.isAbsolute(filePath)) {
    return filePath;
  }
  return path.resolve(process.cwd(), filePath);
}

/**
 * Main CLI handler
 */
async function main() {
  const args = parseArguments(process.argv);

  // Show help if requested or no command provided
  if (args.help || !args.command) {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  // Check if command is valid
  if (args.command !== 'validate') {
    console.error(`Error: Unknown command "${args.command}"`);
    console.error('Use "node src/cli.js --help" for usage information');
    process.exit(1);
  }

  // Check if file path is provided
  if (!args.filePath) {
    console.error('Error: File path is required');
    console.error('Use "node src/cli.js --help" for usage information');
    process.exit(1);
  }

  try {
    // Resolve file path
    const absolutePath = resolveFilePath(args.filePath);

    // Parse configuration file
    console.log(`Reading configuration from: ${args.filePath}`);
    const { data, type } = await parser.parseConfigFile(absolutePath);

    // Get schema
    let selectedSchema = schema.getSchemaByName(args.schemaName);
    if (!selectedSchema) {
      console.error(`Error: Unknown schema "${args.schemaName}"`);
      console.error('Available schemas: application, database, auth');
      process.exit(1);
    }

    // Validate configuration
    const result = validator.validateConfiguration(data, selectedSchema);

    // Report results
    if (args.json) {
      console.log(reporter.reportValidationAsJson(result));
    } else if (args.detailed) {
      console.log(reporter.reportDetailed(result));
    } else {
      console.log(reporter.reportValidationWithFile(result, args.filePath));
    }

    // Exit with appropriate code
    process.exit(result.isValid ? 0 : 1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run main function
if (require.main === module) {
  main().catch((error) => {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}

module.exports = { parseArguments, resolveFilePath };
