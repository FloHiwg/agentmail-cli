import { describe, it } from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_PATH = join(__dirname, '..', 'bin', 'agentmail.js');

function runCLI(args = '') {
  try {
    return execSync(`node ${CLI_PATH} ${args}`, {
      encoding: 'utf-8',
      env: { ...process.env, AGENTMAIL_API_KEY: '' }
    });
  } catch (error) {
    return error.stdout || error.stderr || error.message;
  }
}

describe('CLI', () => {
  it('should show help with --help flag', () => {
    const output = runCLI('--help');
    assert.ok(output.includes('CLI for AgentMail'));
    assert.ok(output.includes('Commands:'));
    assert.ok(output.includes('inboxes'));
    assert.ok(output.includes('threads'));
    assert.ok(output.includes('messages'));
    assert.ok(output.includes('attachments'));
  });

  it('should show version with --version flag', () => {
    const output = runCLI('--version');
    assert.match(output.trim(), /^\d+\.\d+\.\d+$/);
  });

  it('should show inboxes subcommands', () => {
    const output = runCLI('inboxes --help');
    assert.ok(output.includes('list'));
    assert.ok(output.includes('get'));
    assert.ok(output.includes('create'));
    assert.ok(output.includes('delete'));
  });

  it('should show threads subcommands', () => {
    const output = runCLI('threads --help');
    assert.ok(output.includes('list'));
    assert.ok(output.includes('get'));
  });

  it('should show messages subcommands', () => {
    const output = runCLI('messages --help');
    assert.ok(output.includes('send'));
    assert.ok(output.includes('reply'));
    assert.ok(output.includes('forward'));
    assert.ok(output.includes('update'));
  });

  it('should show attachments subcommands', () => {
    const output = runCLI('attachments --help');
    assert.ok(output.includes('get'));
  });

  it('should support --api-key option', () => {
    const output = runCLI('--help');
    assert.ok(output.includes('--api-key'));
    assert.ok(output.includes('-k'));
  });

  it('should require API key for commands', () => {
    const output = runCLI('inboxes list');
    assert.ok(output.includes('API key required') || output.includes('AGENTMAIL_API_KEY'));
  });
});
