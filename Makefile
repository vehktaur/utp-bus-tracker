PACKAGE_MANAGER ?= npm

.PHONY: install dev typecheck lint lint-fix test build check clean help

install: ## Install dependencies and git hooks
	$(PACKAGE_MANAGER) install

dev: ## Start the dev server
	$(PACKAGE_MANAGER) run dev

typecheck: ## TypeScript check
	$(PACKAGE_MANAGER) run typecheck

lint: ## Run the linter
	$(PACKAGE_MANAGER) run lint

lint-fix: ## Fix lint issues
	$(PACKAGE_MANAGER) run lint:fix

test: ## Run tests once
	$(PACKAGE_MANAGER) run test:ci

check: ## Typecheck + lint + test
	$(PACKAGE_MANAGER) run check

build: ## Production build
	$(PACKAGE_MANAGER) run build

clean: ## Remove node_modules and the build output
	rm -rf node_modules dist dev-dist

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)
