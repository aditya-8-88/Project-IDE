import * as vscode from 'vscode';

export function createStatusBarItem(): vscode.StatusBarItem {
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right, 
        0
    );
    statusBarItem.text = "$(person-add) Collaborate";
    statusBarItem.command = 'project-ide.startSession';
    statusBarItem.show();
    return statusBarItem;
}