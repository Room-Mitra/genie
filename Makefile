.PHONY: setup-linter

setup-linter:
	# Install dependencies
	yarn install
	
	yarn husky install


	# Setup Husky
	scripts/setup-husky.sh
