#!/bin/bash
set -e

echo "🔧 Setting up Husky..."

# Install Husky (this creates .husky/_ if not present)
yarn husky install

# Create husky.sh loader script
mkdir -p .husky/_

cat > .husky/_/husky.sh <<'EOF'
#!/bin/sh
# shellcheck shell=sh

if [ -z "$husky_skip_init" ]; then
  debug () {
    [ "$HUSKY_DEBUG" = "1" ] && echo "husky (debug) - $*"
  }

  readonly hook_name="$(basename "$0")"
  debug "current working directory is $(pwd)"
  debug "husky install directory is $(dirname "$0")"

  if [ -f "$HOME/.huskyrc" ]; then
    debug "sourcing ~/.huskyrc"
    . "$HOME/.huskyrc"
  fi
fi
EOF

chmod +x .husky/_/husky.sh

# Create pre-commit hook
cat > .husky/pre-commit <<'EOF'
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🧹 Running lint-staged...\n"

# Prevent lint-staged from restoring stash too early (which clears errors)
export LINT_STAGED_SKIP_BACKUP=true

# Run with full output passthrough
yarn lint-staged 2>&1 | tee /dev/tty

exit_code=$?

if [ "$exit_code" -ne 0 ]; then
  echo ""
  echo "🚫 Linting failed. Commit aborted."
  echo "💡 Run 'yarn lint-staged' manually to see/fix issues."
  exit $exit_code
fi
echo "✅ Linting passed. Proceeding with commit."
EOF

chmod +x .husky/pre-commit

echo "✅ Husky pre-commit hook created."
echo "🎉 Husky setup complete!"
