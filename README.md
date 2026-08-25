# Distillate

Distillate is a local-first review queue for noteworthy engineering challenges solved by AI agents. Agents capture concise cards through MCP; the desktop app lets one user edit, review, revisit, search, and retain them.

## First iteration

- Electron + React + TypeScript desktop application
- Tailwind CSS renderer styling
- Local SQLite persistence in `%LOCALAPPDATA%\Distillate\distillate.sqlite`
- One MCP tool: `capture_card`
- Queue and Reviewed views
- Editable cards, review notes, project filtering, and text search
- Optional model provenance: variant, reasoning effort, token usage, and task duration
- `Unreviewed`, `Reviewed`, and `Revisit` states
- Automatic and explicit `$capture-card` skill workflows

## Development

Requirements: Bun 1.3 or newer.

```powershell
bun install
bun run dev
```

Validation:

```powershell
bun run typecheck
bun test
bun run build
```

Run the MCP server directly:

```powershell
bun run mcp
```

Override the data directory for development or tests with `DISTILLATE_DATA_DIR`.

## Codex integration

The canonical skill bundle lives in `skill/capture-card`. Install it as a user skill to make `$capture-card` available across repositories, then register the MCP server as `distillate`.

For automatic consideration after verified project work, merge the rule in `install/global-AGENTS.md` into the user's global Codex `AGENTS.md`.

## Architecture

The renderer talks only to a typed Electron preload bridge. Electron main and the MCP process share the card schema and storage behavior while using runtime-specific SQLite adapters. MCP runs over STDIO and does not require the desktop window to be open.
