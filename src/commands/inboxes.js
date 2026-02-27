import { getClient } from '../utils/client.js';
import { output, handleError } from '../utils/output.js';

export function inboxCommands(program) {
  const inboxes = program
    .command('inboxes')
    .description('Manage inboxes');

  // List inboxes
  inboxes
    .command('list')
    .description('List all inboxes')
    .option('-l, --limit <number>', 'Max number of items to return', '10')
    .option('--page-token <token>', 'Page token for pagination')
    .action(async (options) => {
      try {
        const client = getClient();
        const result = await client.inboxes.list({
          limit: parseInt(options.limit),
          pageToken: options.pageToken,
        });
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Get inbox
  inboxes
    .command('get <inboxId>')
    .description('Get inbox details')
    .action(async (inboxId) => {
      try {
        const client = getClient();
        const result = await client.inboxes.get(inboxId);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Create inbox
  inboxes
    .command('create')
    .description('Create a new inbox')
    .option('-u, --username <username>', 'Email username')
    .option('-d, --domain <domain>', 'Email domain')
    .option('-n, --display-name <name>', 'Display name')
    .action(async (options) => {
      try {
        const client = getClient();
        const params = {};
        if (options.username) params.username = options.username;
        if (options.domain) params.domain = options.domain;
        if (options.displayName) params.displayName = options.displayName;

        const result = await client.inboxes.create(params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Delete inbox
  inboxes
    .command('delete <inboxId>')
    .description('Delete an inbox (destructive!)')
    .action(async (inboxId) => {
      try {
        const client = getClient();
        await client.inboxes.delete(inboxId);
        output({ success: true, deleted: inboxId });
      } catch (error) {
        handleError(error);
      }
    });
}
