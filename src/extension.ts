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
            try {
                const { stdout: gitRootRaw } = await execAsync(
                    'git rev-parse --show-toplevel',
                    { cwd: uri.fsPath }
                );

                const gitRoot = gitRootRaw.trim();

                const { stdout: branchRaw } = await execAsync(
                    'git rev-parse --abbrev-ref HEAD',
                    { cwd: uri.fsPath }
                );

                const safeBranchName = branchRaw.trim().replace(/\//g, '-');

                const relativePath = path.relative(gitRoot, uri.fsPath);
                const workspaceContent = {
                    folders: [{ path: relativePath || '.' }],
                    settings: {}
                };

                fs.writeFileSync(
                    path.join(gitRoot, `${safeBranchName}.code-workspace`),
                    JSON.stringify(workspaceContent, null, 4)
                );

                vscode.window.showInformationMessage(
                    `Focused: ${safeBranchName}.code-workspace`
                );
            } catch (error) {
                vscode.window.showErrorMessage(`Failed: ${(error as Error).message}`);
            }
        }
    );

    context.subscriptions.push(disposable);
}

export function deactivate() {}
