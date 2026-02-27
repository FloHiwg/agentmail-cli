import { Command } from 'commander';
import { setApiKey } from './utils/client.js';
import { inboxCommands } from './commands/inboxes.js';
import { threadCommands } from './commands/threads.js';
import { messageCommands } from './commands/messages.js';
import { attachmentCommands } from './commands/attachments.js';

const program = new Command();

program
  .name('agentmail')
  .description('CLI for AgentMail - Email accounts for AI agents')
  .version('1.0.0')
  .option('-k, --api-key <key>', 'AgentMail API key (or set AGENTMAIL_API_KEY env var)')
  .hook('preSubcommand', (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.apiKey) {
      setApiKey(opts.apiKey);
    }
  });

// Register command groups
inboxCommands(program);
threadCommands(program);
messageCommands(program);
attachmentCommands(program);

program.parse();
