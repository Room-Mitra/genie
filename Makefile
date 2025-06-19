.PHONY: setup-linter

setup-linter:
	# Install dependencies
	yarn install
	npx mrm lint-staged
