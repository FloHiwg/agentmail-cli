import { getClient } from '../utils/client.js';
import { output, handleError } from '../utils/output.js';

export function attachmentCommands(program) {
  const attachments = program
    .command('attachments')
    .description('Manage attachments');

  // Get attachment
  attachments
    .command('get <threadId> <attachmentId>')
    .description('Get attachment details and download URL')
    .action(async (threadId, attachmentId) => {
      try {
        const client = getClient();
        const result = await client.threads.getAttachment(threadId, attachmentId);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });
}
