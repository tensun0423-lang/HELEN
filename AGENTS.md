# Repository Guidelines

## Project Structure & Module Organization

This repository is newly initialized. It currently has no application source, tests, assets, or dependency manifests. Keep new files organized around the project that is introduced; do not assume a language or framework.

When adding the initial implementation, document its layout in `README.md`. If appropriate, place application code in `src/`, automated tests in `tests/`, and static resources in `assets/`. Create these directories only when they contain relevant files.

## Build, Test, and Development Commands

No build, test, or local development commands are configured yet. Add the required dependency manifest and document exact setup and execution commands alongside the first implementation.

Useful repository checks from the root:

- `git status --short`: inspect pending changes.
- `git diff`: review unstaged edits to tracked files.
- `git diff --check`: detect whitespace errors in tracked changes.

Do not document commands such as `npm test` until the corresponding tooling exists.

## Coding Style & Naming Conventions

No formatter, linter, or language-specific style is established. Follow the conventions of the language selected for the first implementation, then record formatting and indentation rules in its configuration. Use descriptive names and consistent casing within each module. Keep Markdown headings descriptive and examples executable.

## Testing Guidelines

No testing framework or coverage threshold is configured. Introduce suitable automated tests with application code, document how to run them, and cover meaningful behavior and failure cases. Follow the selected framework's test naming conventions. Explain any manual verification when automated checks are unavailable.

## Commit & Pull Request Guidelines

There is no commit history from which to infer a message convention. Use concise, imperative commit subjects, such as `Add initial project setup`, and keep each commit focused.

Pull requests should describe the problem, changes, and verification performed. Link relevant issues when available; include screenshots for visible UI changes. Explicitly identify any checks that could not be run.

## Security & Configuration

Never commit credentials, tokens, or machine-specific secrets. Add suitable ignore rules when introducing tools, and provide example configuration with placeholder values when needed.
