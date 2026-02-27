# AgentMail CLI

CLI tool for [AgentMail](https://agentmail.to) - scalable, API-first email accounts for AI agents.

## Installation

```bash
npm install -g agentmail-cli
```

Or use directly with npx:

```bash
npx agentmail-cli inboxes list
```

## Setup

Get your API key from [agentmail.to](https://agentmail.to)

### Authentication

Two options for providing your API key:

```bash
# Option 1: Environment variable (recommended)
export AGENTMAIL_API_KEY="your_api_key"
agentmail inboxes list

# Option 2: CLI parameter
agentmail --api-key "your_api_key" inboxes list
```

The `--api-key` flag can be placed before any command.

## Usage

```bash
# Show help
agentmail --help

# List inboxes
agentmail inboxes list

# Create an inbox
agentmail inboxes create --display-name "My Bot"

# List threads
agentmail threads list <inbox-id> --limit 10

# Send an email
agentmail messages send <inbox-id> \
  --to user@example.com \
  --subject "Hello" \
  --text "Email body here"

# Reply to a message
agentmail messages reply <inbox-id> <message-id> \
  --text "Thanks for your email!"

# Update labels
agentmail messages update <inbox-id> <message-id> \
  --add-labels '["processed"]' \
  --remove-labels '["unread"]'
```

## Commands

| Command | Description |
|---------|-------------|
| `inboxes list` | List all inboxes |
| `inboxes get <id>` | Get inbox details |
| `inboxes create` | Create new inbox |
| `inboxes delete <id>` | Delete inbox |
| `threads list <inbox-id>` | List threads in inbox |
| `threads get <inbox-id> <thread-id>` | Get thread with messages |
| `messages send <inbox-id>` | Send new email |
| `messages reply <inbox-id> <msg-id>` | Reply to email |
| `messages forward <inbox-id> <msg-id>` | Forward email |
| `messages update <inbox-id> <msg-id>` | Update message labels |
| `attachments get <thread-id> <att-id>` | Get attachment |

## Examples

### Create inbox and send email

```bash
# Create inbox
agentmail inboxes create \
  --username support-bot \
  --domain agentmail.to \
  --display-name "Support Bot"

# Send email (use inbox-id from response)
agentmail messages send <inbox-id> \
  --to customer@example.com \
  --subject "Welcome" \
  --text "Thanks for reaching out!"
```

### Check and process emails

```bash
# List unread threads
agentmail threads list <inbox-id> --labels '["unread"]'

# Get thread details
agentmail threads get <inbox-id> <thread-id>

# Reply to message
agentmail messages reply <inbox-id> <message-id> \
  --text "Thanks for your email!"

# Mark as processed
agentmail messages update <inbox-id> <message-id> \
  --add-labels '["processed"]' \
  --remove-labels '["unread"]'
```

## OpenClaw / Claude Code Skill

This package includes a skill for OpenClaw and Claude Code.

### Installation

```bash
# For OpenClaw
cp -r skills/agentmail ~/.openclaw/skills/

# For Claude Code
cp -r skills/agentmail ~/.claude/skills/
```

## Alternative: MCPorter (MCP)

This package includes [MCPorter](https://github.com/steipete/mcporter) integration for MCP-based usage. MCPorter wraps the [agentmail-mcp](https://github.com/agentmail-to/agentmail-mcp) server into a CLI.

### Current Status

MCPorter support is temporarily unavailable due to an MCP SDK version mismatch:
- `agentmail-mcp` uses `@modelcontextprotocol/sdk@^1.24.1`
- `mcporter` uses `@modelcontextprotocol/sdk@^1.25.1`

This causes `structuredContent` validation errors. Once `agentmail-mcp` updates to SDK 1.25.1+, MCPorter will work.

### Testing MCPorter

Check if the issue is resolved:

```bash
# List available tools
npm run list-tools

# Test a call
export AGENTMAIL_API_KEY="your_key"
npx mcporter call agentmail.list_inboxes
```

If successful, you'll see the inbox list. If you see `structuredContent` errors, the dependency hasn't been updated yet.

### MCPorter Configuration

The MCPorter config is at `config/mcporter.json`:

```json
{
  "mcpServers": {
    "agentmail": {
      "command": "npx",
      "args": ["-y", "agentmail-mcp"],
      "env": {
        "AGENTMAIL_API_KEY": "${AGENTMAIL_API_KEY}"
      }
    }
  }
}
```

### MCPorter Commands

Once working, MCPorter provides a different syntax:

```bash
# List inboxes
npx mcporter call agentmail.list_inboxes

# Create inbox
npx mcporter call agentmail.create_inbox displayName:"My Bot"

# Send message
npx mcporter call agentmail.send_message \
  inboxId:inbox_123 \
  to:'["user@example.com"]' \
  subject:"Hello" \
  text:"Email body"

# Function-call syntax (alternative)
npx mcporter call 'agentmail.send_message(inboxId: "inbox_123", to: ["user@example.com"])'
```

### Switching to MCPorter as Default

When the dependency is updated, you can switch to MCPorter as the primary CLI:

1. Update `package.json`:
```json
{
  "bin": {
    "agentmail": "./bin/agentmail-mcp.js",
    "agentmail-direct": "./bin/agentmail.js"
  }
}
```

2. Regenerate as standalone binary (optional):
```bash
npm run build:mcp          # JavaScript CLI
npm run build:mcp:binary   # Compiled binary (requires Bun)
```

### Command Mapping

| Direct CLI | MCPorter |
|------------|----------|
| `agentmail inboxes list` | `npx mcporter call agentmail.list_inboxes` |
| `agentmail inboxes get X` | `npx mcporter call agentmail.get_inbox inboxId:X` |
| `agentmail inboxes create --display-name Y` | `npx mcporter call agentmail.create_inbox displayName:Y` |
| `agentmail threads list X` | `npx mcporter call agentmail.list_threads inboxId:X` |
| `agentmail messages send X --to a@b.com` | `npx mcporter call agentmail.send_message inboxId:X to:'["a@b.com"]'` |

## Development

```bash
# Clone and install
git clone https://github.com/agentmail-to/agentmail-cli
cd agentmail-cli
npm install

# Run CLI
node bin/agentmail.js inboxes list

# Run MCPorter wrapper
node bin/agentmail-mcp.js list-tools
```

## Links

- [AgentMail](https://agentmail.to) - Get your API key
- [AgentMail Docs](https://docs.agentmail.to) - API documentation
- [agentmail-mcp](https://github.com/agentmail-to/agentmail-mcp) - MCP server
- [agentmail-node](https://github.com/agentmail-to/agentmail-node) - Node.js SDK

## License

MIT
