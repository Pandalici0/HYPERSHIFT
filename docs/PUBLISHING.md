# Publishing to pandalici0/HYPERSHIFT

The repository is prepared for a **public** GitHub project owned by **pandalici0**. Upload only this dedicated repository. Do not upload the original development workspace: it contains local backups, cache indexes and reference archives.

## With Codex

Install the GitHub integration in Codex and connect the account **pandalici0**. After authentication is available, the prepared repository can be created/pushed and the release published. Do not paste an access token or password into chat.

## With GitHub CLI

Requires Git and the [official GitHub CLI](https://cli.github.com/). Run from this repository's root:

```sh
gh auth login --hostname github.com --web --git-protocol https
gh auth status
git status
```

Check that the authenticated account is `pandalici0`. The local prepared repository has a `main` branch and initial commit. If creating a new repository:

```sh
gh repo create pandalici0/HYPERSHIFT --public --description "HYPERSHIFT — a bold Steam theme for Millennium. Custom library, game pages, friends, chat and more. Lavender, black and acid yellow. By pandalici0."
git push -u origin main
git tag v1.8.0
git push origin v1.8.0
```

The tag runs the release workflow, which builds and uploads the install ZIP and checksums. Verify that the workflow and release completed on GitHub. Do not create a duplicate or overwrite an existing repository if that name is already in use; inspect it first.

If starting from the source ZIP instead of the prepared Git checkout, initialize Git and commit the included files first:

```sh
git init --initial-branch=main
git add .
git commit -m "Update HYPERSHIFT 1.8.0"
git remote add origin https://github.com/pandalici0/HYPERSHIFT.git
```

Use your configured Git commit identity. The prepared checkout uses `pandalici0` and a GitHub noreply address locally, without changing your global Git settings. GitHub's association of a commit with your profile depends on your account's configured email.

## Without command-line tools

Create a public repository named `HYPERSHIFT` while signed in as `pandalici0`. Upload the files from the source ZIP, including subdirectories and `.github`, so `skin.json` is at the repository root. Avoid adding a separate nested `HYPERSHIFT` directory or the entire local workspace.

Create a release tagged `v1.8.0` and attach `HYPERSHIFT-Millennium-1.8.0.zip` plus `SHA256SUMS.txt` if the workflow has not already published them. The prepared release text is in `docs/RELEASE-NOTES.md`.

Public GitHub hosting is separate from listing on the Steam Homebrew theme catalogue. A catalogue submission was not prepared or performed.

References: [GitHub CLI repository creation](https://cli.github.com/manual/gh_repo_create), [GitHub CLI releases](https://cli.github.com/manual/gh_release_create), [GitHub Actions Python build guidance](https://docs.github.com/en/actions/tutorials/build-and-test-code/python).
