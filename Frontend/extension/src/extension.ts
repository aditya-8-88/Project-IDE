import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	// console.log('Congratulations, your extension "hello-world" is now active!');
	const disposable = vscode.commands.registerCommand('project-ide.startSession', () => {
		vscode.window.showInformationMessage('Collaboration session started!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
