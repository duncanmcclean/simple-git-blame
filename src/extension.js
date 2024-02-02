const GitHub = require('./hosts/github');
const vscode = require('vscode');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('simple-git-blame.simpleGitBlame', function () {
        if (! vscode.window.activeTextEditor) return vscode.window.showErrorMessage(`Please open a file first.`);

        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
        if (! workspaceFolder) return vscode.window.showErrorMessage(`Please opan a folder or workspace first.`);

        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;
        if (! gitExtension || ! gitExtension.enabled) return vscode.window.showErrorMessage(`Please ensure the Git extension is enabled.`);

        const gitAPI = gitExtension.getAPI(1);

        // Find the repository for the workspace folder & get the name of the GitHub remote repository.
        const repository = gitAPI.repositories.find(repository => repository.rootUri.path === workspaceFolder.uri.path);
        if (! repository) return vscode.window.showErrorMessage(`A Git repository could not be found for this workspace folder.`);

        const originRemote = repository.state.remotes.find(remote => remote.name === 'origin');
        if (! originRemote) return vscode.window.showErrorMessage(`An origin remote could not be found for this Git repository.`);

        // Get the file path relative to the repository root for the current file.
        const absoluteFilePath = vscode.window.activeTextEditor.document.uri.path;
        const relativeFilePath = absoluteFilePath.replace(workspaceFolder.uri.path, '');

        // Get the selected lines.
        const lineSelectionsFrom = vscode.window.activeTextEditor.selection.start.line + 1;
        const lineSelectionsTo = vscode.window.activeTextEditor.selection.end.line + 1;

        if (originRemote.fetchUrl.includes('github.com')) {
            const github = new GitHub(
                originRemote.fetchUrl,
                repository.state.HEAD.name,
                relativeFilePath,
                lineSelectionsFrom,
                lineSelectionsTo
            );

            vscode.env.openExternal(vscode.Uri.parse(github.getBlameUrl()));
        } else {
            return vscode.window.showErrorMessage(`Your Git remote is not supported by this extension.`);
        }
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
