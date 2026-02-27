import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseJsonArray, collect } from '../src/utils/output.js';

describe('parseJsonArray', () => {
  it('should parse JSON array string', () => {
    const result = parseJsonArray('["a", "b", "c"]');
    assert.deepStrictEqual(result, ['a', 'b', 'c']);
  });

  it('should return array as-is', () => {
    const input = ['a', 'b'];
    const result = parseJsonArray(input);
    assert.deepStrictEqual(result, ['a', 'b']);
  });

  it('should wrap single value in array', () => {
    const result = parseJsonArray('single@example.com');
    assert.deepStrictEqual(result, ['single@example.com']);
  });

  it('should return undefined for undefined input', () => {
    const result = parseJsonArray(undefined);
    assert.strictEqual(result, undefined);
  });

  it('should return undefined for empty string', () => {
    const result = parseJsonArray('');
    assert.strictEqual(result, undefined);
  });
});

describe('collect', () => {
  it('should collect values into array', () => {
    let result = [];
    result = collect('a', result);
    result = collect('b', result);
    result = collect('c', result);
    assert.deepStrictEqual(result, ['a', 'b', 'c']);
  });
});
