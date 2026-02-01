/**
 * Parser module for reading and parsing configuration files
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse a JSON configuration file
 * @param {string} filePath - Path to the JSON file
 * @returns {Promise<object>}
 * @throws {Error} If file doesn't exist or JSON is invalid
 */
async function parseJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Parse a .env configuration file
 * @param {string} filePath - Path to the .env file
 * @returns {Promise<object>}
 * @throws {Error} If file doesn't exist or format is invalid
 */
async function parseEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const config = {};

    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        continue;
      }

      // Parse key=value pair
      const [key, ...valueParts] = line.split('=');
      if (!key) continue;

      const trimmedKey = key.trim();
      const value = valueParts.join('=').trim();

      // Remove quotes if present
      let cleanValue = value;
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        cleanValue = value.slice(1, -1);
      }

      config[trimmedKey] = cleanValue;
    }

    return config;
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`File not found: ${filePath}`);
    }
    throw new Error(`Failed to read file: ${error.message}`);
  }
}

/**
 * Determine the file type based on extension
 * @param {string} filePath - Path to the file
 * @returns {string} - 'json' or 'env'
 * @throws {Error} If file type is not supported
 */
function getFileType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.json') {
    return 'json';
  }

  if (path.basename(filePath) === '.env' || ext === '.env') {
    return 'env';
  }

  throw new Error(
    `Unsupported file format: ${filePath}. Supported formats: .json, .env`
  );
}

/**
 * Parse a configuration file based on its type
 * @param {string} filePath - Path to the configuration file
 * @returns {Promise<{data: object, type: string}>}
 * @throws {Error} If file doesn't exist or format is invalid
 */
async function parseConfigFile(filePath) {
  const fileType = getFileType(filePath);

  let data;
  if (fileType === 'json') {
    data = await parseJsonFile(filePath);
  } else if (fileType === 'env') {
    data = await parseEnvFile(filePath);
  }

  return {
    data,
    type: fileType,
  };
}

module.exports = {
  parseJsonFile,
  parseEnvFile,
  parseConfigFile,
  getFileType,
};
