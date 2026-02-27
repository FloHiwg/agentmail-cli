# AgentMail CLI Implementation Plan

## Overview

Build a CLI tool for AgentMail using MCPorter to wrap the agentmail-mcp server, plus create a SKILL.md for OpenClaw/Claude Code integration.

---

## Phase 1: Setup & Dependencies

### 1.1 Initialize Project

```bash
mkdir -p agentmail-cli
cd agentmail-cli
npm init -y
```

### 1.2 Install Dependencies

```bash
# MCPorter for CLI generation
npm install mcporter

# AgentMail MCP server (for reference/testing)
npm install agentmail-mcp
```

### 1.3 Configure Environment

Create `.env.example`:
```env
AGENTMAIL_API_KEY=your_api_key_here
```

---

## Phase 2: Generate CLI with MCPorter

### 2.1 Configure MCP Server

Create `mcporter.json` in project root:
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

### 2.2 Generate CLI

```bash
# List available tools first
npx mcporter list agentmail --all-parameters

# Generate standalone CLI
npx mcporter generate-cli agentmail \
  --output ./dist/agentmail \
  --name agentmail

# Optional: Compile to binary (requires Bun)
npx mcporter generate-cli agentmail \
  --output ./dist/agentmail \
  --compile \
  --name agentmail
```

### 2.3 Test Generated CLI

```bash
# Set API key
export AGENTMAIL_API_KEY="your_key"

# Test commands
./dist/agentmail list-inboxes --limit 5
./dist/agentmail create-inbox --username test --domain agentmail.to
./dist/agentmail send-message --inbox-id inbox_xxx --to '["user@example.com"]' --subject "Test" --text "Hello"
```

---

## Phase 3: Create Wrapper Script (Optional)

If MCPorter output needs customization, create a wrapper at `bin/agentmail`:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Ensure API key is set
if [[ -z "${AGENTMAIL_API_KEY:-}" ]]; then
  echo "Error: AGENTMAIL_API_KEY environment variable is required" >&2
  echo "Get your API key from https://agentmail.to" >&2
  exit 1
fi

# Forward to mcporter
exec npx mcporter call "agentmail.$1" "${@:2}"
```

---

## Phase 4: Create SKILL.md for OpenClaw

### 4.1 Create Skill Directory Structure

```
skills/
└── agentmail/
    ├── SKILL.md
    └── _meta.json (optional)
```

### 4.2 Write SKILL.md

Create `skills/agentmail/SKILL.md` with:
- YAML frontmatter (metadata)
- Description and triggers
- Command reference
- Usage examples
- Authentication instructions

See [Phase 4 Deliverable](#phase-4-deliverable-skillmd) below.

---

## Phase 5: Installation & Distribution

### 5.1 Local Installation

```bash
# Copy skill to OpenClaw skills directory
cp -r skills/agentmail ~/.openclaw/skills/

# Or for Claude Code
cp -r skills/agentmail ~/.claude/skills/
```

### 5.2 Package for Distribution

Update `package.json`:
```json
{
  "name": "agentmail-cli",
  "version": "1.0.0",
  "description": "CLI for AgentMail - Email accounts for AI agents",
  "bin": {
    "agentmail": "./dist/agentmail"
  },
  "files": [
    "dist/",
    "skills/"
  ],
  "scripts": {
    "build": "npx mcporter generate-cli agentmail --output ./dist/agentmail --name agentmail",
    "build:binary": "npx mcporter generate-cli agentmail --output ./dist/agentmail --compile --name agentmail"
  }
}
```

### 5.3 Publish to npm (Optional)

```bash
npm publish
```

---

## Phase 4 Deliverable: SKILL.md

```markdown
---
name: agentmail
description: Manage AI agent email accounts via AgentMail API. Create inboxes, send/receive/reply to emails, manage threads and attachments. Use for "email", "agentmail", "inbox", "send email", "reply email", "forward email", "email agent", "mail api".
metadata:
  author: your-name
  version: "1.0.0"
  docs: https://docs.agentmail.to
  requires:
    bins: ["npx"]
    env: ["AGENTMAIL_API_KEY"]
---

# AgentMail CLI

Email management for AI agents via the AgentMail API.

**Documentation:** https://docs.agentmail.to
**Get API Key:** https://agentmail.to

## Prerequisites

```bash
# Set your API key
export AGENTMAIL_API_KEY="your_api_key"
```

## Quick Reference

### Inbox Management

```bash
# List all inboxes
npx mcporter call agentmail.list_inboxes

# Create a new inbox
npx mcporter call agentmail.create_inbox \
  username:myagent \
  domain:agentmail.to \
  displayName:"My Agent"

# Get inbox details
npx mcporter call agentmail.get_inbox inboxId:inbox_abc123

# Delete an inbox (destructive!)
npx mcporter call agentmail.delete_inbox inboxId:inbox_abc123
```

### Thread Management

```bash
# List threads in inbox
npx mcporter call agentmail.list_threads \
  inboxId:inbox_abc123 \
  limit:10

# List threads with filters
npx mcporter call agentmail.list_threads \
  inboxId:inbox_abc123 \
  labels:'["unread"]' \
  after:"2024-01-01"

# Get thread details (includes all messages)
npx mcporter call agentmail.get_thread \
  inboxId:inbox_abc123 \
  threadId:thread_xyz789
```

### Send Messages

```bash
# Send a new email
npx mcporter call agentmail.send_message \
  inboxId:inbox_abc123 \
  to:'["recipient@example.com"]' \
  subject:"Hello from my agent" \
  text:"This is the email body"

# Send with HTML and CC
npx mcporter call agentmail.send_message \
  inboxId:inbox_abc123 \
  to:'["primary@example.com"]' \
  cc:'["copy@example.com"]' \
  subject:"Important Update" \
  html:"<h1>Hello</h1><p>HTML content here</p>"

# Send with attachments
npx mcporter call agentmail.send_message \
  inboxId:inbox_abc123 \
  to:'["user@example.com"]' \
  subject:"Document attached" \
  text:"Please find the document attached." \
  attachments:'[{"filename":"doc.pdf","url":"https://example.com/doc.pdf"}]'
```

### Reply & Forward

```bash
# Reply to a message
npx mcporter call agentmail.reply_to_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  text:"Thank you for your email..."

# Reply all
npx mcporter call agentmail.reply_to_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  text:"Replying to everyone..." \
  replyAll:true

# Forward a message
npx mcporter call agentmail.forward_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  to:'["forward-to@example.com"]' \
  text:"FYI - see below"
```

### Labels & Organization

```bash
# Add labels to a message
npx mcporter call agentmail.update_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  addLabels:'["important","processed"]'

# Remove labels
npx mcporter call agentmail.update_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  removeLabels:'["unread"]'
```

### Attachments

```bash
# Get attachment content (auto-extracts text from PDF/DOCX)
npx mcporter call agentmail.get_attachment \
  inboxId:inbox_abc123 \
  threadId:thread_xyz789 \
  attachmentId:att_ghi012
```

## Available Tools

| Tool | Description | Destructive |
|------|-------------|-------------|
| `list_inboxes` | List all inboxes | No |
| `get_inbox` | Get inbox details | No |
| `create_inbox` | Create new inbox | No |
| `delete_inbox` | Delete an inbox | **Yes** |
| `list_threads` | List threads in inbox | No |
| `get_thread` | Get thread with messages | No |
| `get_attachment` | Get attachment content | No |
| `send_message` | Send new email | No |
| `reply_to_message` | Reply to email | No |
| `forward_message` | Forward email | No |
| `update_message` | Update message labels | No |

## Common Workflows

### Check for New Emails

```bash
# List unread threads
npx mcporter call agentmail.list_threads \
  inboxId:inbox_abc123 \
  labels:'["unread"]' \
  limit:20
```

### Process and Archive Email

```bash
# 1. Get thread
npx mcporter call agentmail.get_thread inboxId:inbox_abc123 threadId:thread_xyz

# 2. Process content...

# 3. Mark as read and label as processed
npx mcporter call agentmail.update_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  addLabels:'["processed"]' \
  removeLabels:'["unread"]'
```

### Auto-Reply Workflow

```bash
# 1. Check for emails needing reply
npx mcporter call agentmail.list_threads \
  inboxId:inbox_abc123 \
  labels:'["needs-reply"]'

# 2. Get thread details
npx mcporter call agentmail.get_thread inboxId:inbox_abc123 threadId:thread_xyz

# 3. Send reply
npx mcporter call agentmail.reply_to_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  text:"Thank you for reaching out..."

# 4. Update labels
npx mcporter call agentmail.update_message \
  inboxId:inbox_abc123 \
  messageId:msg_def456 \
  addLabels:'["replied"]' \
  removeLabels:'["needs-reply"]'
```

## Error Handling

If commands fail, check:
1. `AGENTMAIL_API_KEY` is set and valid
2. Inbox/thread/message IDs are correct
3. Email addresses are properly formatted as JSON arrays

## Links

- **API Documentation:** https://docs.agentmail.to
- **Get API Key:** https://agentmail.to
- **MCP Server:** https://github.com/agentmail-to/agentmail-mcp
- **Node SDK:** https://github.com/agentmail-to/agentmail-node
```

---

## Checklist

- [ ] **Phase 1**: Initialize project and install dependencies
- [ ] **Phase 2**: Generate CLI with MCPorter
  - [ ] Create mcporter.json config
  - [ ] Run generate-cli command
  - [ ] Test all 11 tools
- [ ] **Phase 3**: Create wrapper script (if needed)
- [ ] **Phase 4**: Create SKILL.md
  - [ ] Write frontmatter metadata
  - [ ] Document all commands
  - [ ] Add usage examples
  - [ ] Include common workflows
- [ ] **Phase 5**: Package and distribute
  - [ ] Update package.json
  - [ ] Test local installation
  - [ ] Publish to npm (optional)
  - [ ] Submit to OpenClaw ClawHub (optional)

---

## Timeline Estimate

| Phase | Tasks |
|-------|-------|
| Phase 1 | Project setup |
| Phase 2 | CLI generation & testing |
| Phase 3 | Wrapper script (optional) |
| Phase 4 | SKILL.md creation |
| Phase 5 | Packaging & distribution |

---

## References

- [MCPorter GitHub](https://github.com/steipete/mcporter)
- [AgentMail MCP](https://github.com/agentmail-to/agentmail-mcp)
- [AgentMail Docs](https://docs.agentmail.to)
- [OpenClaw Skills](https://github.com/openclaw/skills)
- [OpenClaw FAQ](https://docs.openclaw.ai/help/faq)
