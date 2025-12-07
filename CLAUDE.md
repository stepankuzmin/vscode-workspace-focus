# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A VS Code extension that creates workspace files focused on specific folders, automatically named after the current git branch. When a user right-clicks a folder in the explorer and selects "Focus on this folder", the extension creates a `.code-workspace` file at the git repository root.

## Development Commands

```bash
# Install dependencies
npm install

# Compile TypeScript (builds to out/ directory)
npm run compile

# Watch mode for development
npm run watch

# Run tests
npm test

# Package extension into .vsix file
npm run package

# Install locally for testing
code --install-extension workspace-focus-*.vsix
```

## Testing

Integration tests in `src/test/extension.test.ts` verify:
- Command registration
- Workspace file creation with correct structure
- Branch name sanitization (slashes to dashes)
- Relative path handling

Tests use `@vscode/test-cli` to run in VS Code's Extension Development Host. They create temporary git repositories for testing.

## Architecture

The extension consists of a single command handler in `src/extension.ts`:

- **Command**: `workspace-focus.focus` - Registered in `activate()`, accessible via explorer context menu on folders
- **Execution flow**:
  1. Uses `git rev-parse --show-toplevel` to find repository root
  2. Uses `git rev-parse --abbrev-ref HEAD` to get current branch name
  3. Sanitizes branch name (replaces `/` with `-`)
  4. Creates workspace file with relative path from git root to selected folder
  5. Writes `<branch-name>.code-workspace` to repository root

The workspace file contains a JSON structure with a `folders` array pointing to the selected folder's relative path.

## Publishing

CI automatically publishes to VS Code Marketplace when a git tag is pushed (requires `VSCE_PAT` secret).
