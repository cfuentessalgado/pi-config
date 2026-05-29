# pi-config

Personal configuration for the [pi coding agent](https://www.npmjs.com/package/@earendil-works/pi-coding-agent).

This repo is meant to be checked out locally and symlinked into `~/.pi/agent` with GNU Stow.

## What's included

- `themes/catppuccin-mocha.json` — Catppuccin Mocha theme for the Pi TUI.
- `themes/tokyonight.json` — Tokyo Night theme for the Pi TUI.
- `extensions/view-last-response/` — Pi extension that opens the last assistant response in `$VISUAL`, `$EDITOR`, or `vi`.
  - Command: `view-last-response`
  - Shortcut: `ctrl+alt+g`
- `extensions/copy-last-response/` — Pi extension that copies the last assistant response to the clipboard.
  - Command: `copy-last-response`
  - Shortcut: `ctrl+alt+c`
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

The install script ensures the target directories exist, then runs:

```sh
mkdir -p ~/.pi/agent/themes ~/.pi/agent/extensions
stow -t ~/.pi/agent/themes themes
stow -t ~/.pi/agent/extensions extensions
```

This creates symlinks from this repo into `~/.pi/agent/themes` and `~/.pi/agent/extensions`.

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
stow -D -t ~/.pi/agent/themes themes
stow -D -t ~/.pi/agent/extensions extensions
```

## Repository layout

```text
.
├── extensions/
│   ├── copy-last-response/
│   └── view-last-response/
├── themes/
│   ├── catppuccin-mocha.json
│   └── tokyonight.json
├── .gitignore
├── .stow-local-ignore
├── AGENTS.md
├── install
└── README.md
```
