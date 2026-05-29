# Agent Guidelines

This is a public Pi configuration repo. Treat every change as potentially publishable.

## Secret safety

- Do not commit API keys, tokens, private keys, credentials, session logs, transcripts, or machine-specific private config.
- Before adding a new file, inspect it for secrets and personal data.
- Prefer examples/placeholders over real values, e.g. `YOUR_API_KEY_HERE`.
- If a file must contain private values, keep it out of git and add an ignore rule.
- Do not add generated Pi session/history/conversation data.

## Stow safety

- This repo is stowed into `~/.pi/agent`.
- Keep repository metadata and docs out of the stow target via `.stow-local-ignore`.
- Be careful with files that already exist in `~/.pi/agent`; do not use `stow --adopt` by default in this public repo because it can pull private local config into the repository.

## Editing guidelines

- Keep changes small and reviewable.
- Update `README.md` when install steps, shortcuts, extensions, or layout change.
- Prefer portable shell commands in scripts.
- Avoid hard-coded absolute paths, usernames, hostnames, or local-only assumptions.
- Run `git status --short` and review diffs before committing.
