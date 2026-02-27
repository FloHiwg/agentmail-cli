# AgentMail CLI Research

## Overview

This document summarizes research on building a CLI from the [agentmail-mcp](https://github.com/agentmail-to/agentmail-mcp) server, including analysis of MCP-to-CLI conversion tools.

---

## AgentMail MCP Server

### Repository
- **URL**: https://github.com/agentmail-to/agentmail-mcp
- **Version**: 0.2.1
- **Language**: TypeScript (100%)
- **License**: MIT

### Dependencies
```json
{
  "@modelcontextprotocol/sdk": "^1.24.1",
  "agentmail": "^0.2.1",
  "agentmail-toolkit": "^0.2.0"
}
```

### Architecture
The MCP server is a thin wrapper that:
1. Creates an `AgentMailClient` from the `agentmail` SDK
2. Creates an `AgentMailToolkit` from `agentmail-toolkit/mcp`
3. Registers all toolkit tools with the MCP server
4. Connects via stdio transport

**Source**: [`src/index.ts`](https://github.com/agentmail-to/agentmail-mcp/blob/main/src/index.ts)
```typescript
const client = new AgentMailClient({ baseUrl })
const toolkit = new AgentMailToolkit(client)
const server = new McpServer({ name: 'AgentMail', version: '0.1.0' })
for (const tool of toolkit.getTools(toolNames))
    server.registerTool(tool.name, tool, tool.callback)
```

---

## Available MCP Tools

The toolkit exposes 11 tools:

| Tool | Description | Read-Only | Destructive |
|------|-------------|-----------|-------------|
| `list_inboxes` | List inboxes | Yes | No |
| `get_inbox` | Get inbox details | Yes | No |
| `create_inbox` | Create inbox | No | No |
| `delete_inbox` | Delete inbox | No | **Yes** |
| `list_threads` | List threads in inbox | Yes | No |
| `get_thread` | Get thread details | Yes | No |
| `get_attachment` | Get attachment (with PDF/DOCX text extraction) | Yes | No |
| `send_message` | Send a new message | No | No |
| `reply_to_message` | Reply to a message | No | No |
| `forward_message` | Forward a message | No | No |
| `update_message` | Update message labels | No | No |

### Tool Parameters

**Source**: [`agentmail-toolkit/node/src/schemas.ts`](https://github.com/agentmail-to/agentmail-toolkit/blob/main/node/src/schemas.ts)

```typescript
// List/Pagination
ListItemsParams: { limit?: number, pageToken?: string }

// Inbox operations
GetInboxParams: { inboxId: string }
CreateInboxParams: { username?: string, domain?: string, displayName?: string }

// Thread operations
ListInboxItemsParams: { inboxId, limit?, pageToken?, labels?, before?, after? }
GetThreadParams: { inboxId, threadId }
GetAttachmentParams: { inboxId, threadId, attachmentId }

// Message operations
SendMessageParams: { inboxId, to[], cc?[], bcc?[], subject?, text?, html?, labels?, attachments? }
ReplyToMessageParams: { inboxId, messageId, text?, html?, labels?, attachments?, replyAll? }
ForwardMessageParams: { inboxId, messageId, to[], cc?[], bcc?[], subject?, text?, html?, labels?, attachments? }
UpdateMessageParams: { inboxId, messageId, addLabels?[], removeLabels?[] }
```

---

## AgentMail API

### Documentation
- **URL**: https://docs.agentmail.to
- **OpenAPI Spec**: Available in JSON/YAML

### Core Features
- **Inboxes**: API-first email accounts for AI agents
- **Messages**: Send, receive, reply, forward
- **Threads**: Conversation grouping
- **Drafts**: Human-in-the-loop review, scheduled sending
- **Labels**: State management, campaign tracking
- **Attachments**: Send and download
- **Webhooks**: Event-driven workflows (delivery, bounce, complaint)
- **WebSocket**: Real-time notifications
- **Custom Domains**: SPF, DKIM, DMARC support
- **Pods**: Multi-tenant email management

### SDK
- **npm**: `agentmail` (v0.3.3)
- **Repo**: https://github.com/agentmail-to/agentmail-node
- **Reference**: [Full API Reference](https://github.com/agentmail-to/agentmail-node/blob/HEAD/reference.md)

---

## MCP-to-CLI Conversion Options

### Option 1: MCPorter (Recommended)

**URL**: https://github.com/steipete/mcporter
**Version**: 0.7.4

#### Features
- Auto-discovers MCP servers from Cursor, Claude Desktop, Codex
- Generates standalone CLI tools from MCP server definitions
- Can compile to binary executables (via Bun or Rolldown)
- Typed TypeScript wrappers with compile-time safety
- Connection pooling and daemon mode
- OAuth support with browser login flows
- Typo correction ("Did you mean?")

#### CLI Generation
```bash
# Generate CLI from MCP server
npx mcporter generate-cli agentmail

# Invoke tools directly
npx mcporter call agentmail.send_message inboxId:inbox_123 to:'["user@example.com"]' subject:'Hello'

# Function-call syntax
npx mcporter call 'agentmail.send_message(inboxId: "inbox_123", to: ["user@example.com"])'
```

#### Pros
- Mature, well-maintained (v0.7.4)
- Automatic schema handling and validation
- Can bundle into standalone binary
- Supports connection pooling

#### Cons
- Adds dependency on mcporter runtime
- May be overkill if only need simple CLI

---

### Option 2: MCPLI

**URL**: https://www.async-let.com/posts/introducing-mcpli/

Turns stdio-based MCP servers into first-class CLIs with:
- Tools as commands
- `--help` discovery
- Persistent daemon for state preservation

---

### Option 3: mcp-cli (by Phil Schmid)

**URL**: https://www.philschmid.de/mcp-cli

Lightweight CLI for dynamic MCP discovery:
- 3-subcommand architecture: `info`, `grep`, `call`
- Connection pooling daemon
- Tool filtering support

---

### Option 4: FastMCP CLI

**URL**: https://gofastmcp.com/patterns/cli

Built-in CLI for FastMCP servers with `fastmcp call` command.

---

### Option 5: Custom CLI (Direct SDK Usage)

Build a CLI directly using the `agentmail` SDK without MCP layer.

#### Pros
- No MCP overhead
- Full control over CLI design
- Simpler architecture
- Can use Commander.js, yargs, or other CLI frameworks

#### Cons
- More development work
- Need to implement argument parsing, help text, output formatting

#### Implementation Sketch
```typescript
#!/usr/bin/env node
import { Command } from 'commander'
import { AgentMailClient } from 'agentmail'

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY })

const program = new Command()
  .name('agentmail')
  .description('CLI for AgentMail API')

program
  .command('inboxes')
  .description('Manage inboxes')
  .command('list')
  .option('-l, --limit <n>', 'Max results', '10')
  .action(async (opts) => {
    const result = await client.inboxes.list({ limit: parseInt(opts.limit) })
    console.log(JSON.stringify(result, null, 2))
  })

// ... more commands
```

---

## Recommendation

### For Quick Setup: Use MCPorter

```bash
# 1. Install mcporter
npm install -g mcporter

# 2. Generate CLI
npx mcporter generate-cli agentmail --output ./agentmail-cli

# 3. Optionally compile to binary
npx mcporter generate-cli agentmail --compile --output ./agentmail
```

### For Custom Experience: Build with SDK

If you want:
- Polished CLI UX with custom help text
- Shell completions
- Interactive prompts
- Custom output formatting
- Integration with Claude Code skill

Then build a custom CLI using:
- `agentmail` SDK directly (skip MCP layer)
- `commander` or `yargs` for CLI framework
- `inquirer` for interactive prompts (optional)
- `chalk` for colored output (optional)

---

## Claude Code Skill Integration

To make the CLI accessible via Claude Code skill, create a `skill.md`:

```markdown
# agentmail skill

This skill provides access to AgentMail for managing AI agent email accounts.

## Commands

- `agentmail inboxes list` - List all inboxes
- `agentmail inboxes create [--username <u>] [--domain <d>]` - Create inbox
- `agentmail inboxes get <inbox-id>` - Get inbox details
- `agentmail threads list <inbox-id>` - List threads
- `agentmail threads get <inbox-id> <thread-id>` - Get thread
- `agentmail send <inbox-id> --to <email> --subject <s> --text <body>` - Send message
- `agentmail reply <inbox-id> <message-id> --text <body>` - Reply to message

## Environment
Requires `AGENTMAIL_API_KEY` environment variable.
```

---

## Next Steps

1. **Decide approach**: MCPorter vs Custom CLI
2. **Set up project**: Initialize npm package
3. **Implement CLI**: Either generate via mcporter or build with SDK
4. **Create skill.md**: For Claude Code integration
5. **Test**: Verify all commands work
6. **Document**: Add README with usage examples

---

## Sources

- [agentmail-mcp GitHub](https://github.com/agentmail-to/agentmail-mcp)
- [mcporter GitHub](https://github.com/steipete/mcporter)
- [AgentMail Documentation](https://docs.agentmail.to)
- [agentmail-node SDK](https://github.com/agentmail-to/agentmail-node)
- [agentmail-toolkit](https://github.com/agentmail-to/agentmail-toolkit)
- [MCPLI Introduction](https://www.async-let.com/posts/introducing-mcpli/)
- [mcp-cli by Phil Schmid](https://www.philschmid.de/mcp-cli)
- [FastMCP CLI](https://gofastmcp.com/patterns/cli)
- [CLI vs MCP Cost Analysis](https://kanyilmaz.me/2026/02/23/cli-vs-mcp.html)
