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

        const originRemote = repository.state.remotes.find(remote => remote.name === 'origin');
        let repositoryName = originRemote.fetchUrl;

        if (! repositoryName.includes('github.com')) {
            return vscode.window.showInformationMessage('Houston, we have a problem. Not a GitHub repository.');
        }

        repositoryName = repositoryName.replace('.git', '');
        repositoryName = repositoryName.replace('git@github.com:', '');

        // Get the current branch.
        const branchName = repository.state.HEAD.name;

        // Get the file path relative to the repository root for the current file.
        const absoluteFilePath = vscode.window.activeTextEditor.document.uri.path;
        const relativeFilePath = absoluteFilePath.replace(workspaceFolder.uri.path, '');

        // Get the selected lines.
        const lineSelectionsFrom = vscode.window.activeTextEditor.selection.start.line + 1;
        const lineSelectionsTo = vscode.window.activeTextEditor.selection.end.line + 1;

        const lineNumbers = lineSelectionsFrom === lineSelectionsTo ? `L${lineSelectionsFrom}` : `L${lineSelectionsFrom}-L${lineSelectionsTo}`;

        // Construct the Git Blame URL.
        const githubBlameUrl = `https://github.com/${repositoryName}/blame/${branchName}${relativeFilePath}#${lineNumbers}`

        // Open the Git Blame URL in the default browser.
        vscode.env.openExternal(vscode.Uri.parse(githubBlameUrl));
	});

	context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
	activate,
	deactivate
}
