import { getClient } from '../utils/client.js';
import { output, handleError, parseJsonArray } from '../utils/output.js';

export function threadCommands(program) {
  const threads = program
    .command('threads')
    .description('Manage threads');

  // List threads
  threads
    .command('list <inboxId>')
    .description('List threads in an inbox')
    .option('-l, --limit <number>', 'Max number of items to return', '10')
    .option('--page-token <token>', 'Page token for pagination')
    .option('--labels <labels>', 'Labels to filter by (JSON array or comma-separated)')
    .option('--before <datetime>', 'Filter items before datetime (ISO 8601)')
    .option('--after <datetime>', 'Filter items after datetime (ISO 8601)')
    .action(async (inboxId, options) => {
      try {
        const client = getClient();
        const params = {
          limit: parseInt(options.limit),
        };

        if (options.pageToken) params.pageToken = options.pageToken;
        if (options.labels) {
          params.labels = parseJsonArray(options.labels);
        }
        if (options.before) params.before = options.before;
        if (options.after) params.after = options.after;

        const result = await client.inboxes.threads.list(inboxId, params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Get thread
  threads
    .command('get <inboxId> <threadId>')
    .description('Get thread details with all messages')
    .action(async (inboxId, threadId) => {
      try {
        const client = getClient();
        const result = await client.inboxes.threads.get(inboxId, threadId);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });
}
