.PHONY: help install-hooks dev build test test-integration smoke lint fmt pages-preview release clean

help:
	@awk 'BEGIN {FS = ":.*##"} /^[a-zA-Z0-9_-]+:.*##/ {printf "%-20s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install-hooks: ## wire local git hooks
	git config core.hooksPath .githooks

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
