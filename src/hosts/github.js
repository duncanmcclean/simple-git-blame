class GitHub {
    constructor(remoteUrl, branchName, filePath, selectedFromLines, selectedToLines) {
        this.remoteUrl = remoteUrl;
        this.branchName = branchName;
        this.filePath = filePath;
        this.selectedFromLines = selectedFromLines;
        this.selectedToLines = selectedToLines;
    }

    /**
     * Strips git@github.com and .git from the remoteUrl to get the repository name.
     * Example: git@github.com:foo/bar.git => foo/bar
     * @returns string
     */
    repositoryName() {
        if (this.remoteUrl.includes('https://')) {
            return this.remoteUrl.replace(/(https:\/\/github.com\/|\.git)/g, '');
        }

        return this.remoteUrl.replace(/(.git|git@github.com:)/g, '');
    }

    /**
     * Returns the Git Blame URL, based on the provided parameters.
     * @returns string
     */
    getBlameUrl() {
        const lineNumbers = this.selectedFromLines === this.selectedToLines
            ? `L${this.selectedFromLines}`
            : `L${this.selectedFromLines}-L${this.selectedToLines}`;

        return `https://github.com/${this.repositoryName()}/blame/${this.branchName}${this.filePath}#${lineNumbers}`
    }
}

module.exports = GitHub;
