#!/bin/sh
# nvmx use.sh - POSIX-compliant script to activate a Node.js version

set -e

# Default paths
NVMX_HOME="${NVMX_HOME:-$HOME/.nvmx}"
NVMX_VERSIONS_DIR="${NVMX_HOME}/versions"

# Get arguments
VERSION="$1"
if [ -z "$VERSION" ]; then
  echo "Error: Version argument is required"
  exit 1
fi

# Check if the version exists
VERSION_DIR="${NVMX_VERSIONS_DIR}/${VERSION}"
if [ ! -d "$VERSION_DIR" ]; then
  echo "Error: Node.js version $VERSION is not installed"
  echo "To install it, run: nvmx install $VERSION"
  exit 1
fi

# Output the shell commands to modify PATH
echo "export PATH=\"${VERSION_DIR}/bin:\$PATH\""
echo "echo \"Now using Node.js ${VERSION}\""