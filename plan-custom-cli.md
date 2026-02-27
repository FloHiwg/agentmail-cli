# Custom CLI Implementation Plan

## Background

The MCPorter-based approach has an MCP SDK version incompatibility:
- `agentmail-mcp` uses `@modelcontextprotocol/sdk@^1.24.1`
- `mcporter` uses `@modelcontextprotocol/sdk@^1.25.1`

This causes `structuredContent` validation errors. Until agentmail-mcp updates, we'll build a direct CLI using the `agentmail` SDK.

## Goals

1. Build a direct CLI using the `agentmail` npm package
2. Keep existing MCPorter setup intact for future use
3. Maintain same command interface as documented in SKILL.md
4. Support all 11 tools from the MCP server

---

## Architecture

```
bin/
├── agentmail.js          # Entry point (direct CLI - NEW)
├── agentmail-mcp.js      # MCPorter wrapper (existing, renamed)

src/
├── cli.js                # Commander.js CLI definition
├── commands/
│   ├── inboxes.js        # Inbox commands (list, get, create, delete)
│   ├── threads.js        # Thread commands (list, get)
│   ├── messages.js       # Message commands (send, reply, forward, update)
│   └── attachments.js    # Attachment commands (get)
└── utils/
    ├── client.js         # AgentMail client initialization
    └── output.js         # JSON output formatting
```

---

## Phase 1: Project Structure

### 1.1 Rename existing MCPorter wrapper

```bash
mv bin/agentmail.js bin/agentmail-mcp.js
```

### 1.2 Update package.json

Add both entry points:
```json
{
  "bin": {
    "agentmail": "./bin/agentmail.js",
    "agentmail-mcp": "./bin/agentmail-mcp.js"
  },
  "scripts": {
    "start": "node bin/agentmail.js",
    "start:mcp": "node bin/agentmail-mcp.js"
  }
}
```

---

## Phase 2: Core Implementation

### 2.1 Client Initialization (`src/utils/client.js`)

```javascript
import { AgentMailClient } from 'agentmail';

export function getClient() {
  const apiKey = process.env.AGENTMAIL_API_KEY;
  if (!apiKey) {
    console.error('Error: AGENTMAIL_API_KEY required');
    process.exit(1);
  }
  return new AgentMailClient({ apiKey });
}
```

### 2.2 Output Utilities (`src/utils/output.js`)

```javascript
export function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

export function handleError(error) {
  console.error(JSON.stringify({
    error: error.message,
    statusCode: error.statusCode
  }, null, 2));
  process.exit(1);
}
```

### 2.3 CLI Entry Point (`src/cli.js`)

```javascript
import { Command } from 'commander';
import { inboxCommands } from './commands/inboxes.js';
import { threadCommands } from './commands/threads.js';
import { messageCommands } from './commands/messages.js';
import { attachmentCommands } from './commands/attachments.js';

const program = new Command();

program
  .name('agentmail')
  .description('CLI for AgentMail - Email accounts for AI agents')
  .version('1.0.0');

// Register command groups
inboxCommands(program);
threadCommands(program);
messageCommands(program);
attachmentCommands(program);

program.parse();
```

---

## Phase 3: Command Implementation

### 3.1 Inbox Commands (`src/commands/inboxes.js`)

| Command | SDK Method | Parameters |
|---------|------------|------------|
| `agentmail inboxes list` | `client.inboxes.list()` | `--limit`, `--page-token` |
| `agentmail inboxes get <id>` | `client.inboxes.get(id)` | |
| `agentmail inboxes create` | `client.inboxes.create()` | `--username`, `--domain`, `--display-name` |
| `agentmail inboxes delete <id>` | `client.inboxes.delete(id)` | |

### 3.2 Thread Commands (`src/commands/threads.js`)

| Command | SDK Method | Parameters |
|---------|------------|------------|
| `agentmail threads list <inbox-id>` | `client.inboxes.threads.list()` | `--limit`, `--labels`, `--before`, `--after` |
| `agentmail threads get <inbox-id> <thread-id>` | `client.inboxes.threads.get()` | |

### 3.3 Message Commands (`src/commands/messages.js`)

| Command | SDK Method | Parameters |
|---------|------------|------------|
| `agentmail messages send <inbox-id>` | `client.inboxes.messages.send()` | `--to`, `--cc`, `--bcc`, `--subject`, `--text`, `--html` |
| `agentmail messages reply <inbox-id> <message-id>` | `client.inboxes.messages.reply()` | `--text`, `--html`, `--reply-all` |
| `agentmail messages forward <inbox-id> <message-id>` | `client.inboxes.messages.forward()` | `--to`, `--text`, `--subject` |
| `agentmail messages update <inbox-id> <message-id>` | `client.inboxes.messages.update()` | `--add-labels`, `--remove-labels` |

### 3.4 Attachment Commands (`src/commands/attachments.js`)

| Command | SDK Method | Parameters |
|---------|------------|------------|
| `agentmail attachments get <thread-id> <attachment-id>` | `client.threads.getAttachment()` | |

---

## Phase 4: Entry Point

### 4.1 Main Entry (`bin/agentmail.js`)

```javascript
#!/usr/bin/env node
import '../src/cli.js';
```

---

## Phase 5: Update SKILL.md

Update the SKILL.md to reflect the new command structure:

**Old (MCPorter):**
```bash
npx mcporter call agentmail.list_inboxes
```

**New (Direct CLI):**
```bash
agentmail inboxes list
```

Create a mapping section showing both syntaxes for compatibility.

---

## Phase 6: Testing

### 6.1 Test Each Command

```bash
# Load env
export $(grep -v '^#' .env | xargs)

# Test inboxes
agentmail inboxes list
agentmail inboxes create --display-name "Test Bot"
agentmail inboxes get <inbox-id>
agentmail inboxes delete <inbox-id>

# Test threads
agentmail threads list <inbox-id>
agentmail threads get <inbox-id> <thread-id>

# Test messages
agentmail messages send <inbox-id> --to user@example.com --subject "Test" --text "Hello"
agentmail messages reply <inbox-id> <message-id> --text "Reply"
agentmail messages update <inbox-id> <message-id> --add-labels processed

# Test attachments
agentmail attachments get <thread-id> <attachment-id>
```

---

## Command Comparison

| MCP Tool | MCPorter Command | Direct CLI Command |
|----------|------------------|-------------------|
| `list_inboxes` | `npx mcporter call agentmail.list_inboxes` | `agentmail inboxes list` |
| `get_inbox` | `npx mcporter call agentmail.get_inbox inboxId:X` | `agentmail inboxes get X` |
| `create_inbox` | `npx mcporter call agentmail.create_inbox displayName:Y` | `agentmail inboxes create --display-name Y` |
| `delete_inbox` | `npx mcporter call agentmail.delete_inbox inboxId:X` | `agentmail inboxes delete X` |
| `list_threads` | `npx mcporter call agentmail.list_threads inboxId:X` | `agentmail threads list X` |
| `get_thread` | `npx mcporter call agentmail.get_thread inboxId:X threadId:Y` | `agentmail threads get X Y` |
| `get_attachment` | `npx mcporter call agentmail.get_attachment ...` | `agentmail attachments get X Y` |
| `send_message` | `npx mcporter call agentmail.send_message ...` | `agentmail messages send X --to ... --subject ...` |
| `reply_to_message` | `npx mcporter call agentmail.reply_to_message ...` | `agentmail messages reply X Y --text ...` |
| `forward_message` | `npx mcporter call agentmail.forward_message ...` | `agentmail messages forward X Y --to ...` |
| `update_message` | `npx mcporter call agentmail.update_message ...` | `agentmail messages update X Y --add-labels ...` |

---

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `bin/agentmail.js` | Modify | New direct CLI entry point |
| `bin/agentmail-mcp.js` | Rename | Keep MCPorter wrapper |
| `src/cli.js` | Create | Commander.js setup |
| `src/utils/client.js` | Create | Client initialization |
| `src/utils/output.js` | Create | Output formatting |
| `src/commands/inboxes.js` | Create | Inbox commands |
| `src/commands/threads.js` | Create | Thread commands |
| `src/commands/messages.js` | Create | Message commands |
| `src/commands/attachments.js` | Create | Attachment commands |
| `package.json` | Modify | Add both bin entries |
| `skills/agentmail/SKILL.md` | Modify | Update command syntax |

---

## Checklist

- [ ] **Phase 1**: Restructure project
  - [ ] Rename `bin/agentmail.js` to `bin/agentmail-mcp.js`
  - [ ] Update `package.json` with both bin entries
- [ ] **Phase 2**: Create core utilities
  - [ ] `src/utils/client.js`
  - [ ] `src/utils/output.js`
  - [ ] `src/cli.js`
- [ ] **Phase 3**: Implement commands
  - [ ] `src/commands/inboxes.js` (4 commands)
  - [ ] `src/commands/threads.js` (2 commands)
  - [ ] `src/commands/messages.js` (4 commands)
  - [ ] `src/commands/attachments.js` (1 command)
- [ ] **Phase 4**: Create entry point
  - [ ] `bin/agentmail.js`
- [ ] **Phase 5**: Update documentation
  - [ ] Update `SKILL.md` with new command syntax
  - [ ] Update `README.md`
- [ ] **Phase 6**: Test all commands
  - [ ] Test with real API key

---

## Switching Back to MCPorter

When `agentmail-mcp` updates to MCP SDK 1.25.1+:

1. Test MCPorter again:
   ```bash
   npm run start:mcp list-tools
   ```

2. If working, update `package.json` to use MCPorter as default:
   ```json
   {
     "bin": {
       "agentmail": "./bin/agentmail-mcp.js",
       "agentmail-direct": "./bin/agentmail.js"
     }
   }
   ```

3. Revert SKILL.md to MCPorter syntax
