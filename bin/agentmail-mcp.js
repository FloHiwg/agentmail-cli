#!/usr/bin/env node

import { spawn } from 'child_process';

const args = process.argv.slice(2);

// Check for API key
if (!process.env.AGENTMAIL_API_KEY) {
  console.error('Error: AGENTMAIL_API_KEY environment variable is required');
  console.error('Get your API key from https://agentmail.to');
  process.exit(1);
}

// If no args, show help
if (args.length === 0) {
  console.log(`
AgentMail CLI - Email accounts for AI agents

Usage:
  agentmail <tool> [parameters...]
  agentmail list-tools

Tools:
  list_inboxes      List all inboxes
  get_inbox         Get inbox details
  create_inbox      Create a new inbox
  delete_inbox      Delete an inbox
  list_threads      List threads in an inbox
  get_thread        Get thread with messages
  get_attachment    Get attachment content
  send_message      Send a new email
  reply_to_message  Reply to an email
  forward_message   Forward an email
  update_message    Update message labels

Examples:
  agentmail list_inboxes
  agentmail create_inbox username:mybot displayName:"My Bot"
  agentmail send_message inboxId:inbox_123 to:'["user@example.com"]' subject:"Hello"

Environment:
  AGENTMAIL_API_KEY  Your AgentMail API key (required)

Documentation: https://docs.agentmail.to
`);
  process.exit(0);
}

// Handle special commands
if (args[0] === 'list-tools' || args[0] === '--list-tools') {
  const mcporter = spawn('npx', ['mcporter', 'list', 'agentmail', '--all-parameters'], {
    stdio: 'inherit',
    env: process.env
  });
  mcporter.on('close', (code) => process.exit(code));
} else {
  // Forward to mcporter
  const tool = args[0];
  const toolArgs = args.slice(1);

  const mcporterArgs = ['mcporter', 'call', `agentmail.${tool}`, ...toolArgs];

  const mcporter = spawn('npx', mcporterArgs, {
    stdio: 'inherit',
    env: process.env
  });

  mcporter.on('close', (code) => process.exit(code));
}
