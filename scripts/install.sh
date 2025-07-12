#!/bin/sh
# nvmx install.sh - POSIX-compliant script to install Node.js versions

set -e

# Default paths
NVMX_HOME="${NVMX_HOME:-$HOME/.nvmx}"
NVMX_VERSIONS_DIR="${NVMX_HOME}/versions"
NVMX_CACHE_DIR="${NVMX_HOME}/cache"

# Ensure directories exist
mkdir -p "${NVMX_VERSIONS_DIR}"
mkdir -p "${NVMX_CACHE_DIR}"

# Get arguments
VERSION="$1"
if [ -z "$VERSION" ]; then
  echo "Error: Version argument is required"
  exit 1
fi

# Remove 'v' prefix if present
VERSION=$(echo "$VERSION" | sed 's/^v//')

# Determine system architecture
get_arch() {
  ARCH=$(uname -m)
  case "$ARCH" in
    x86_64)
      echo "x64"
      ;;
    aarch64|arm64)
      echo "arm64"
      ;;
    *)
      echo "Error: Unsupported architecture: $ARCH"
      exit 1
      ;;
  esac
}

# Determine system platform
get_platform() {
  PLATFORM=$(uname -s)
  case "$PLATFORM" in
    Darwin)
      echo "darwin"
      ;;
    Linux)
      echo "linux"
      ;;
    *)
      echo "Error: Unsupported platform: $PLATFORM"
      exit 1
      ;;
  esac
}

ARCH=$(get_arch)
PLATFORM=$(get_platform)

# Construct download URL
NODE_DIST_URL="https://nodejs.org/dist/v${VERSION}"
TARBALL_NAME="node-v${VERSION}-${PLATFORM}-${ARCH}.tar.gz"
DOWNLOAD_URL="${NODE_DIST_URL}/${TARBALL_NAME}"
TARBALL_PATH="${NVMX_CACHE_DIR}/${TARBALL_NAME}"

# Download the tarball
echo "Downloading Node.js v${VERSION} for ${PLATFORM}-${ARCH}..."
if command -v curl > /dev/null 2>&1; then
  curl -L -o "${TARBALL_PATH}" "${DOWNLOAD_URL}"
elif command -v wget > /dev/null 2>&1; then
  wget -O "${TARBALL_PATH}" "${DOWNLOAD_URL}"
else
  echo "Error: Neither curl nor wget is available"
  exit 1
fi

# Create version directory
VERSION_DIR="${NVMX_VERSIONS_DIR}/v${VERSION}"
mkdir -p "${VERSION_DIR}"

# Extract the tarball
echo "Extracting Node.js v${VERSION}..."
tar -xzf "${TARBALL_PATH}" -C "${NVMX_CACHE_DIR}"
EXTRACTED_DIR="${NVMX_CACHE_DIR}/node-v${VERSION}-${PLATFORM}-${ARCH}"

# Move files to version directory
cp -R "${EXTRACTED_DIR}/"* "${VERSION_DIR}/"

# Clean up
rm -rf "${EXTRACTED_DIR}"

echo "Node.js v${VERSION} has been installed successfully"
echo "To use this version, run: nvmx use v${VERSION}"