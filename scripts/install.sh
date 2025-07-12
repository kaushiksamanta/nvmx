#!/bin/bash
set -e

# NVMX Installer
# Usage: curl -o- https://raw.githubusercontent.com/kaushiksamanta/nvmx/main/scripts/install.sh | bash
# or: wget -qO- https://raw.githubusercontent.com/kaushiksamanta/nvmx/main/scripts/install.sh | bash

{ # This ensures the entire script is downloaded

NVMX_VERSION="0.1.0"
NVMX_HOME="${NVMX_HOME:-$HOME/.nvmx}"
NVMX_SOURCE="https://github.com/kaushiksamanta/nvmx"
NVMX_INSTALL_DIR="$NVMX_HOME/nvmx"
NVMX_REPO="kaushiksamanta/nvmx"

# Detect profile file
detect_profile() {
  local DETECTED_PROFILE
  DETECTED_PROFILE=""
  
  if [ -n "${PROFILE}" ]; then
    echo "${PROFILE}"
    return
  fi

  if [ -f "$HOME/.bash_profile" ]; then
    DETECTED_PROFILE="$HOME/.bash_profile"
  elif [ -f "$HOME/.bashrc" ]; then
    DETECTED_PROFILE="$HOME/.bashrc"
  elif [ -f "$HOME/.zshrc" ]; then
    DETECTED_PROFILE="$HOME/.zshrc"
  fi

  if [ -z "$DETECTED_PROFILE" ]; then
    if [ -n "$BASH_VERSION" ]; then
      if [ -f "$HOME/.bashrc" ]; then
        DETECTED_PROFILE="$HOME/.bashrc"
      fi
    elif [ -n "$ZSH_VERSION" ]; then
      DETECTED_PROFILE="$HOME/.zshrc"
    fi
  fi

  if [ -z "$DETECTED_PROFILE" ]; then
    echo "Profile not found. Please manually add the following to your shell profile:"
    echo ""
    echo 'export PATH="$HOME/.nvmx/bin:$PATH"'
    echo 'eval "$(nvmx shell)"'
    return
  fi
  
  echo "$DETECTED_PROFILE"
}

# Check if Node.js is installed
if ! command -v node >/dev/null 2>&1; then
  echo "Error: Node.js is required to install nvmx"
  echo "Please install Node.js first and then try again"
  exit 1
fi

# Create NVMX_HOME directory if it doesn't exist
mkdir -p "$NVMX_HOME"
mkdir -p "$NVMX_HOME/bin"
mkdir -p "$NVMX_HOME/versions"

# Download and extract the latest release
echo "Downloading nvmx v${NVMX_VERSION}..."
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

if command -v curl >/dev/null 2>&1; then
  curl -L -o "$TEMP_DIR/nvmx.tar.gz" "https://github.com/$NVMX_REPO/archive/refs/tags/v${NVMX_VERSION}.tar.gz"
elif command -v wget >/dev/null 2>&1; then
  wget -O "$TEMP_DIR/nvmx.tar.gz" "https://github.com/$NVMX_REPO/archive/refs/tags/v${NVMX_VERSION}.tar.gz"
else
  echo "Error: curl or wget is required to install nvmx"
  exit 1
fi

echo "Extracting..."
tar -xzf "$TEMP_DIR/nvmx.tar.gz" -C "$TEMP_DIR"
mv "$TEMP_DIR/nvmx-${NVMX_VERSION}" "$NVMX_INSTALL_DIR"

# Install dependencies and build
echo "Installing dependencies..."
cd "$NVMX_INSTALL_DIR"
npm install --production

echo "Building nvmx..."
npm run build

# Create symlink to bin directory
echo "Creating symlinks..."
ln -sf "$NVMX_INSTALL_DIR/bin/nvmx" "$NVMX_HOME/bin/nvmx"

# Add to PATH and shell integration
PROFILE=$(detect_profile)
if [ -n "$PROFILE" ]; then
  echo "Adding nvmx to $PROFILE..."
  
  # Check if already in PATH
  if ! grep -q "export PATH=\"\$HOME/.nvmx/bin:\$PATH\"" "$PROFILE"; then
    echo "" >> "$PROFILE"
    echo "# nvmx" >> "$PROFILE"
    echo "export PATH=\"\$HOME/.nvmx/bin:\$PATH\"" >> "$PROFILE"
  fi
  
  # Check if shell integration is already added
  if ! grep -q "eval \"\$(nvmx shell)\"" "$PROFILE"; then
    echo "eval \"\$(nvmx shell)\"" >> "$PROFILE"
  fi
  
  echo "nvmx has been added to your PATH and shell integration has been set up."
  echo "Please restart your terminal or run 'source $PROFILE' to start using nvmx."
fi

echo ""
echo "nvmx v${NVMX_VERSION} has been installed successfully!"
echo ""
echo "To get started, run:"
echo "  nvmx install lts"
echo "  nvmx use lts"
echo ""
echo "For more information, visit: $NVMX_SOURCE"

} # This ensures the entire script is downloaded