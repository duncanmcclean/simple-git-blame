// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "simple-git-blame" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('simple-git-blame.simpleGitBlame', function () {
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);

        if (! workspaceFolder) {
            return vscode.window.showInformationMessage('Houston, we have a problem. No workspace folder.');
        }

        const gitExtension = vscode.extensions.getExtension('vscode.git')?.exports;

        if (! gitExtension || ! gitExtension.enabled) {
            return vscode.window.showInformationMessage('Houston, we have a problem. No git extension.');
        }

        const gitAPI = gitExtension.getAPI(1);

        // Get the repository for the current workspace folder.
        const repository = gitAPI.repositories.find(repository => repository.rootUri.path === workspaceFolder.uri.path);

        console.log(repository);

        // Get GitHub repository URL from `origin` remote.
        const originRemote = repository.state.remotes.find(remote => remote.name === 'origin');
        let githubRepository = originRemote.fetchUrl;

        if (! githubRepository.includes('github.com')) {
            return vscode.window.showInformationMessage('Houston, we have a problem. Not a GitHub repository.');
        }

        githubRepository = githubRepository.replace('.git', '');
        githubRepository = githubRepository.replace('git@github.com:', '');

        // Get current branch.
        const branchName = repository.state.HEAD.name;

        // Get the file path relative to the repository root for the current file.
        const absoluteFilePath = vscode.window.activeTextEditor.document.uri.path;
        const relativeFilePath = absoluteFilePath.replace(workspaceFolder.uri.path, '');

        // Get the current line number
        const lineNumber = vscode.window.activeTextEditor.selection.start.line + 1; // TODO: support multiple line selections.

        // Construct the Git Blame URL.
        const githubBlameUrl = `https://github.com/${githubRepository}/blame/${branchName}${relativeFilePath}#L${lineNumber}`

        // Open the Git Blame URL in the default browser.
        vscode.env.openExternal(vscode.Uri.parse(githubBlameUrl));
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
