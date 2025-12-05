import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';

const execAsync = promisify(exec);

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'workspace-focus.focus',
        async (uri: vscode.Uri) => {
            if (!uri) {
                vscode.window.showErrorMessage('No folder selected');
                return;
            }

            const folderPath = uri.fsPath;

            try {
                // Get git root
                const { stdout: gitRootRaw } = await execAsync(
                    'git rev-parse --show-toplevel',
                    { cwd: folderPath }
                );
                const gitRoot = gitRootRaw.trim();

                // Get current branch
                const { stdout: branchRaw } = await execAsync(
                    'git rev-parse --abbrev-ref HEAD',
                    { cwd: folderPath }
                );
                const branch = branchRaw.trim();

                // Sanitize branch name for filename (replace / with -)
                const safeBranchName = branch.replace(/\//g, '-');

                // Calculate relative path from git root to clicked folder
                const relativePath = path.relative(gitRoot, folderPath);

                // Create workspace content
                const workspaceContent = {
                    folders: [
                        {
                            path: relativePath || '.'
                        }
                    ],
                    settings: {}
                };

                // Write workspace file
                const workspaceFilePath = path.join(gitRoot, `${safeBranchName}.code-workspace`);
                fs.writeFileSync(
                    workspaceFilePath,
                    JSON.stringify(workspaceContent, null, 4)
                );

                vscode.window.showInformationMessage(
                    `Focused: ${safeBranchName}.code-workspace`
                );
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error';
                if (message.includes('not a git repository')) {
                    vscode.window.showErrorMessage('Not inside a git repository');
                } else {
                    vscode.window.showErrorMessage(`Failed to create workspace: ${message}`);
                }
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
