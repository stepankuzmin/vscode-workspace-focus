import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

suite('Workspace Focus Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	suiteSetup(async () => {
		// Activate the extension before running tests
		const ext = vscode.extensions.getExtension('StepanKuzmin.workspace-focus');
		if (ext && !ext.isActive) {
			await ext.activate();
		}
	});

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('StepanKuzmin.workspace-focus'));
	});

	test('Command should be registered', async () => {
		const commands = await vscode.commands.getCommands();
		assert.ok(commands.includes('workspace-focus.focus'));
	});

	test('Command creates workspace file with correct name', async function() {
		this.timeout(10000); // Git operations can be slow

		// Create a temporary test directory with git repo
		const tmpDir = path.join(__dirname, '../../test-workspace');

		// Clean up if exists
		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true });
		}

		fs.mkdirSync(tmpDir, { recursive: true });

		try {
			// Initialize git repo
			await execAsync('git init', { cwd: tmpDir });
			await execAsync('git config user.name "Test User"', { cwd: tmpDir });
			await execAsync('git config user.email "test@example.com"', { cwd: tmpDir });

			// Create an initial commit (required for branch creation)
			fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Test');
			await execAsync('git add .', { cwd: tmpDir });
			await execAsync('git commit -m "Initial commit"', { cwd: tmpDir });
			await execAsync('git checkout -b feature/test-branch', { cwd: tmpDir });

			// Create a test folder
			const testFolder = path.join(tmpDir, 'subfolder');
			fs.mkdirSync(testFolder);

			// Execute the command
			const uri = vscode.Uri.file(testFolder);
			await vscode.commands.executeCommand('workspace-focus.focus', uri);

			// Small delay to ensure file is written
			await new Promise(resolve => setTimeout(resolve, 100));

			// Check workspace file was created
			const workspaceFile = path.join(tmpDir, 'feature-test-branch.code-workspace');
			assert.ok(fs.existsSync(workspaceFile), 'Workspace file should exist');

			// Verify workspace file content
			const content = JSON.parse(fs.readFileSync(workspaceFile, 'utf-8'));
			assert.strictEqual(content.folders[0].path, 'subfolder');
			assert.ok(content.settings);
		} finally {
			// Clean up
			if (fs.existsSync(tmpDir)) {
				fs.rmSync(tmpDir, { recursive: true, force: true });
			}
		}
	});

	test('Branch name sanitization: slashes to dashes', async function() {
		this.timeout(10000);

		const tmpDir = path.join(__dirname, '../../test-workspace-2');

		if (fs.existsSync(tmpDir)) {
			fs.rmSync(tmpDir, { recursive: true, force: true });
		}

		fs.mkdirSync(tmpDir, { recursive: true });

		try {
			await execAsync('git init', { cwd: tmpDir });
			await execAsync('git config user.name "Test User"', { cwd: tmpDir });
			await execAsync('git config user.email "test@example.com"', { cwd: tmpDir });

			// Create an initial commit
			fs.writeFileSync(path.join(tmpDir, 'README.md'), '# Test');
			await execAsync('git add .', { cwd: tmpDir });
			await execAsync('git commit -m "Initial commit"', { cwd: tmpDir });
			await execAsync('git checkout -b feature/auth/login', { cwd: tmpDir });

			const uri = vscode.Uri.file(tmpDir);
			await vscode.commands.executeCommand('workspace-focus.focus', uri);

			// Small delay to ensure file is written
			await new Promise(resolve => setTimeout(resolve, 100));

			const workspaceFile = path.join(tmpDir, 'feature-auth-login.code-workspace');
			assert.ok(fs.existsSync(workspaceFile), 'Workspace file with sanitized name should exist');
		} finally {
			if (fs.existsSync(tmpDir)) {
				fs.rmSync(tmpDir, { recursive: true, force: true });
			}
		}
	});
});
