import { AgentMailClient } from 'agentmail';

let client = null;
let cliApiKey = null;

export function setApiKey(key) {
  cliApiKey = key;
}

export function getClient() {
  if (client) return client;

  const apiKey = cliApiKey || process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.error('Error: API key required');
    console.error('Use --api-key <key> or set AGENTMAIL_API_KEY environment variable');
    console.error('Get your API key from https://agentmail.to');
    process.exit(1);
  }

  client = new AgentMailClient({ apiKey });
  return client;
}
