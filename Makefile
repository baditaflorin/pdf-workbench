.PHONY: help install-hooks hooks-pre-commit hooks-commit-msg hooks-pre-push hooks-post-merge hooks-post-checkout dev build test test-integration smoke lint fmt pages-preview release clean

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## wire local git hooks
	git config core.hooksPath .githooks

hooks-pre-commit: ## run pre-commit hook manually
	.githooks/pre-commit

hooks-commit-msg: ## validate a sample commit message
	printf "feat: sample\n" >/tmp/pdf-workbench-commit-msg && .githooks/commit-msg /tmp/pdf-workbench-commit-msg

hooks-pre-push: ## run pre-push hook manually
	.githooks/pre-push

hooks-post-merge: ## run post-merge hook manually
	.githooks/post-merge

hooks-post-checkout: ## run post-checkout hook manually
	.githooks/post-checkout

dev: ## run the frontend dev server
	npm run dev

build: ## build GitHub Pages output into docs/
	npm run build
	test -f docs/index.html
	test -f docs/404.html

test: ## run unit tests
	npm run test

test-integration: ## run integration tests
	@echo "No integration tests for Mode A v1."

smoke: ## build, serve docs/, and run Playwright smoke tests
	npm run smoke

lint: ## run linters and static checks
	npm run lint
	npm run fmt:check
	npx tsc -b --pretty false

fmt: ## format source files
	npm run fmt

pages-preview: ## serve docs/ as GitHub Pages would
	npm run pages-preview

release: ## tag the current commit as v0.1.0
	git tag v0.1.0

clean: ## remove generated files
	rm -rf docs coverage node_modules/.tmp
