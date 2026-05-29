# pi-config

Personal configuration for the [pi coding agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent).

This repo is meant to be checked out locally and symlinked into `~/.pi/agent` with GNU Stow.

## What's included

- `themes/catppuccin-mocha.json` — Catppuccin Mocha theme for the Pi TUI.
- `extensions/view-last-response/` — Pi extension that opens the last assistant response in `$VISUAL`, `$EDITOR`, or `vi`.
  - Command: `view-last-response`
  - Shortcut: `ctrl+alt+g`
- `install` — convenience script for stowing this repo into `~/.pi/agent`.

## Requirements

- macOS or Linux shell environment
- [GNU Stow](https://www.gnu.org/software/stow/)
- Pi coding agent installed and configured

On macOS, install Stow with Homebrew:

```sh
brew install stow
```

## Installation

Clone the repo, then run:

```sh
./install
```

The install script runs:

```sh
stow -t ~/.pi/agent/ .
```

This creates symlinks from this repo into `~/.pi/agent`.

The installer intentionally does **not** use `stow --adopt`, because this is a public repo and `--adopt` can pull existing private local config into the repository.

## Updating

Pull the latest changes and re-run the installer if new files were added:

```sh
git pull
./install
```

## Uninstalling

From the repo root:

```sh
stow -D -t ~/.pi/agent/ .
```

## Repository layout

```text
.
├── extensions/
│   └── view-last-response/
├── themes/
│   └── catppuccin-mocha.json
├── .gitignore
├── .stow-local-ignore
├── AGENTS.md
├── install
└── README.md
```
