# Contributing

Thanks for helping make PDF Workbench better.

## Local Setup

```bash
npm install
make install-hooks
make test
make build
make smoke
```

## Commit Style

Use Conventional Commits:

- `feat:` for user-visible features
- `fix:` for bug fixes
- `docs:` for documentation
- `test:` for tests
- `chore:` for maintenance

## Pull Request Expectations

- Keep changes focused.
- Add tests for new behavior.
- Run `make lint`, `make test`, and `make smoke`.
- Do not commit secrets, sample private PDFs, or user data.
