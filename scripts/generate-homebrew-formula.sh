#!/bin/bash
set -e

# Check if a version argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.1.0"
  exit 1
fi

VERSION="$1"
REPO_URL="https://github.com/kaushiksamanta/nvmx"
ARCHIVE_URL="$REPO_URL/archive/refs/tags/v$VERSION.tar.gz"
FORMULA_TEMPLATE="homebrew/nvmx.rb"
FORMULA_OUTPUT="homebrew/nvmx-$VERSION.rb"

# Create temporary directory
TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

# Download the tarball
echo "Downloading tarball from $ARCHIVE_URL..."
curl -L -o "$TMP_DIR/nvmx-$VERSION.tar.gz" "$ARCHIVE_URL"

# Calculate SHA256
echo "Calculating SHA256 hash..."
SHA256=$(shasum -a 256 "$TMP_DIR/nvmx-$VERSION.tar.gz" | awk '{print $1}')

# Generate the formula
echo "Generating Homebrew formula..."
sed "s/REPLACE_WITH_ACTUAL_SHA256_AFTER_RELEASE/$SHA256/g" "$FORMULA_TEMPLATE" > "$FORMULA_OUTPUT"
sed -i '' "s/v0.1.0/v$VERSION/g" "$FORMULA_OUTPUT"

echo "Formula generated at $FORMULA_OUTPUT"
echo "To test the formula locally, run:"
echo "  brew install --build-from-source $FORMULA_OUTPUT"
echo "To submit to Homebrew, run:"
echo "  brew tap homebrew/core"
echo "  cp $FORMULA_OUTPUT $(brew --repository homebrew/core)/Formula/n/nvmx.rb"
echo "  cd $(brew --repository homebrew/core)"
echo "  git checkout -b nvmx-$VERSION"
echo "  git add Formula/n/nvmx.rb"
echo "  git commit -m \"nvmx $VERSION (new formula)\""
echo "  git push -u origin nvmx-$VERSION"
echo "Then create a pull request on GitHub."