import { getClient } from '../utils/client.js';
import { output, handleError, parseJsonArray, collect } from '../utils/output.js';

export function messageCommands(program) {
  const messages = program
    .command('messages')
    .description('Send and manage messages');

  // Send message
  messages
    .command('send <inboxId>')
    .description('Send a new email')
    .requiredOption('--to <email>', 'Recipient email (can specify multiple)', collect, [])
    .option('--cc <email>', 'CC recipient (can specify multiple)', collect, [])
    .option('--bcc <email>', 'BCC recipient (can specify multiple)', collect, [])
    .option('-s, --subject <subject>', 'Email subject')
    .option('-t, --text <body>', 'Plain text body')
    .option('--html <body>', 'HTML body')
    .option('--labels <labels>', 'Labels (JSON array)')
    .action(async (inboxId, options) => {
      try {
        const client = getClient();
        const params = {
          to: options.to,
        };

        if (options.cc.length > 0) params.cc = options.cc;
        if (options.bcc.length > 0) params.bcc = options.bcc;
        if (options.subject) params.subject = options.subject;
        if (options.text) params.text = options.text;
        if (options.html) params.html = options.html;
        if (options.labels) params.labels = parseJsonArray(options.labels);

        const result = await client.inboxes.messages.send(inboxId, params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Reply to message
  messages
    .command('reply <inboxId> <messageId>')
    .description('Reply to an email')
    .option('-t, --text <body>', 'Plain text body')
    .option('--html <body>', 'HTML body')
    .option('--reply-all', 'Reply to all recipients')
    .option('--labels <labels>', 'Labels (JSON array)')
    .action(async (inboxId, messageId, options) => {
      try {
        const client = getClient();
        const params = {};

        if (options.text) params.text = options.text;
        if (options.html) params.html = options.html;
        if (options.replyAll) params.replyAll = true;
        if (options.labels) params.labels = parseJsonArray(options.labels);

        const result = await client.inboxes.messages.reply(inboxId, messageId, params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Forward message
  messages
    .command('forward <inboxId> <messageId>')
    .description('Forward an email')
    .requiredOption('--to <email>', 'Recipient email (can specify multiple)', collect, [])
    .option('--cc <email>', 'CC recipient (can specify multiple)', collect, [])
    .option('--bcc <email>', 'BCC recipient (can specify multiple)', collect, [])
    .option('-s, --subject <subject>', 'Email subject')
    .option('-t, --text <body>', 'Plain text body')
    .option('--html <body>', 'HTML body')
    .option('--labels <labels>', 'Labels (JSON array)')
    .action(async (inboxId, messageId, options) => {
      try {
        const client = getClient();
        const params = {
          to: options.to,
        };

        if (options.cc.length > 0) params.cc = options.cc;
        if (options.bcc.length > 0) params.bcc = options.bcc;
        if (options.subject) params.subject = options.subject;
        if (options.text) params.text = options.text;
        if (options.html) params.html = options.html;
        if (options.labels) params.labels = parseJsonArray(options.labels);

        const result = await client.inboxes.messages.forward(inboxId, messageId, params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });

  // Update message
  messages
    .command('update <inboxId> <messageId>')
    .description('Update message labels')
    .option('--add-labels <labels>', 'Labels to add (JSON array)')
    .option('--remove-labels <labels>', 'Labels to remove (JSON array)')
    .action(async (inboxId, messageId, options) => {
      try {
        const client = getClient();
        const params = {};

        if (options.addLabels) params.addLabels = parseJsonArray(options.addLabels);
        if (options.removeLabels) params.removeLabels = parseJsonArray(options.removeLabels);

        const result = await client.inboxes.messages.update(inboxId, messageId, params);
        output(result);
      } catch (error) {
        handleError(error);
      }
    });
}
