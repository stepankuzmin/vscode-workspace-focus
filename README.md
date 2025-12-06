# Workspace Focus

A VS Code extension that creates workspace files focused on a specific folder, named after the current git branch.

## Usage

1. Right-click on any folder in the VS Code explorer
2. Select **"Focus on this folder"**
3. A `.code-workspace` file is created at your git repository root

The workspace file is named after your current git branch (e.g., `feature-auth.code-workspace` for branch `feature/auth`).

## Installation

### From Marketplace

[Install from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=StepanKuzmin.workspace-focus)

### From VSIX

```sh
code --install-extension workspace-focus-0.0.2.vsix
```

### From Source

```sh
npm install
npm run compile
npm run package
code --install-extension workspace-focus-0.0.2.vsix
```

## Requirements

- VS Code 1.74.0 or later

## License

MIT
