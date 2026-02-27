export function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function handleError(error) {
  const errorOutput = {
    error: error.message || 'Unknown error',
  };

  if (error.statusCode) {
    errorOutput.statusCode = error.statusCode;
  }

  if (error.body) {
    errorOutput.details = error.body;
  }

  console.error(JSON.stringify(errorOutput, null, 2));
  process.exit(1);
}

export function parseJsonArray(value) {
  if (!value) return undefined;

  // If it's already an array (from multiple --to flags)
  if (Array.isArray(value)) return value;

  // If it looks like JSON, parse it
  if (value.startsWith('[')) {
    try {
      return JSON.parse(value);
    } catch {
      console.error(`Error: Invalid JSON array: ${value}`);
      process.exit(1);
    }
  }

  // Otherwise treat as single value
  return [value];
}

export function collect(value, previous) {
  return previous.concat([value]);
}
