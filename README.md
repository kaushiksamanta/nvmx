# nvmx

A POSIX-compliant Node.js version manager written in TypeScript, with shell script integration for environment handling.

## Features

- Written in Node.js + TypeScript with TypeBox for runtime type validation
- POSIX-compliant shell interface
- Manages multiple Node.js versions installed locally
- Allows installing, listing, and using specific Node.js versions
- Exposes a shell function for session-level environment switching (modifies `$PATH`)
- All installed versions reside in `~/.nvmx/versions`
- Support for `.nvmxrc` or `.node-version` file auto-loading
- Compatible with Linux/macOS (POSIX environments)
- Comprehensive test suite using Vitest
- **Version aliases** for easy reference to commonly used versions
- **Remote version caching** for faster operation
- **Shell completions** for Bash, Zsh, and Fish
- **Automatic updates** with notifications for new versions

## Installation

### Prerequisites

- Node.js (any version to bootstrap)
- npm or yarn

### Install with curl or wget (macOS and Linux)

```bash
# Using curl
curl -o- https://raw.githubusercontent.com/kaushiksamanta/nvmx/main/scripts/install.sh | bash

# Using wget
wget -qO- https://raw.githubusercontent.com/kaushiksamanta/nvmx/main/scripts/install.sh | bash
```

The installation script will:
- Download and install nvmx to `~/.nvmx`
- Add nvmx to your PATH
- Set up shell integration automatically
- Create the necessary directories for Node.js versions

### Install from source

```bash
# Clone the repository
git clone https://github.com/kaushiksamanta/nvmx.git
cd nvmx

# Install dependencies
npm install

# Build the project
npm run build

# Create a symlink to make nvmx available globally
npm link
```

### Development Setup

```bash
# Clone the repository
git clone https://github.com/kaushiksamanta/nvmx.git
cd nvmx

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Run in development mode with auto-reloading
npm run dev
```

## Usage

### Core Commands

- `nvmx install <version|alias>` – Downloads and installs a specific Node.js version
- `nvmx use <version|alias>` – Sets active Node.js version for the current shell
- `nvmx list` – Lists installed versions
- `nvmx ls-remote` – Lists available Node.js versions from the official source
- `nvmx current` – Shows the currently active version
- `nvmx uninstall <version>` – Removes a specific Node.js version
- `nvmx alias` – Manages version aliases
- `nvmx cache` – Manages remote version cache
- `nvmx completion` – Generates shell completion scripts
- `nvmx update` – Updates nvmx to the latest version
- `nvmx check-update` – Checks if a new version is available

### Shell Integration

To enable shell integration, add the following to your `.bashrc`, `.zshrc`, or equivalent:

```bash
# Add nvmx shell integration
eval "$(nvmx shell)"

# Optional: Auto-switch Node.js version when changing directories
cd() { builtin cd "$@" && nvmx_auto; }
```

### Examples

```bash
# Install the latest LTS version
nvmx install lts

# Install a specific version
nvmx install 18.17.1

# Use a specific version in the current shell
eval "$(nvmx use v18.17.1)"

# List installed versions
nvmx list

# List available versions
nvmx ls-remote

# Show current version
nvmx current

# Uninstall a version
nvmx uninstall v16.20.0
```

### Version Files

nvmx supports automatic version switching using `.nvmxrc` or `.node-version` files:

```bash
# Create a .nvmxrc file in your project
echo "v18.17.1" > .nvmxrc

# When you cd into the project directory, nvmx will automatically switch to this version
# (if you've set up the shell integration with auto-switching)
```

## Configuration

nvmx can be configured using the `config` command:

```bash
# Set a custom mirror
nvmx config set mirror https://npmmirror.com/mirrors/node/

# Set a proxy
nvmx config set proxy http://proxy.example.com:8080

# Set a default version
nvmx config set default v18.17.1

# Get current configuration
nvmx config get mirror
nvmx config get proxy
nvmx config get default
```

### Aliases

nvmx supports creating aliases for Node.js versions, making it easier to reference commonly used versions:

```bash
# List all aliases
nvmx alias list

# Create an alias
nvmx alias set lts v18.17.1
nvmx alias set project-a v16.14.2

# Use an alias
nvmx use lts
nvmx use project-a

# Remove an alias
nvmx alias rm project-a
```

### Remote Version Caching

nvmx caches the list of remote versions to improve performance:

```bash
# List remote versions (uses cache if available)
nvmx ls-remote

# Force refresh the cache
nvmx ls-remote --force

# Set cache TTL (time-to-live) in minutes
nvmx cache set-ttl 60

# Clear the remote versions cache
nvmx cache clear-remote
```

### Shell Completions

nvmx provides shell completion scripts for Bash, Zsh, and Fish:

```bash
# Generate and install Bash completion
nvmx completion bash > ~/.nvmx/bash_completion
echo 'source ~/.nvmx/bash_completion' >> ~/.bashrc

# Generate and install Zsh completion
nvmx completion zsh > ~/.nvmx/zsh_completion
echo 'source ~/.nvmx/zsh_completion' >> ~/.zshrc

# Generate and install Fish completion
nvmx completion fish > ~/.config/fish/completions/nvmx.fish
```

### Automatic Updates

nvmx can check for updates and update itself:

```bash
# Check for updates
nvmx check-update

# Update nvmx to the latest version
nvmx update
```

nvmx will also notify you when a new version is available when running other commands.

## Project Architecture

### Type System

nvmx uses TypeBox for runtime type validation and TypeScript for static type checking:

```
src/
├── cli.ts       - Command-line interface
├── config.ts    - Configuration management
├── manager.ts   - Version management
├── utils.ts     - Utility functions
├── completions.ts - Shell completion scripts
├── update.ts    - Automatic update functionality
└── types/
    ├── common.ts    - Common types (Version, Path, Arch, Platform, Url)
    ├── config.ts    - Configuration types (NvmxConfig, CacheConfig, Aliases)
    ├── manager.ts   - Version management types (NodeRelease, InstalledVersions)
    ├── cli.ts       - CLI-related types (NvmxCommand, ConfigKey, AliasCommand)
    └── index.ts     - Re-exports all types for easy importing
```

TypeBox provides several benefits:
- Runtime type validation with JSON Schema
- Strongly typed interfaces for all components
- Self-documenting code with clear type definitions
- Improved error handling with type validation

### Code Quality

nvmx uses ESLint and Prettier to ensure code quality and consistent formatting:

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

ESLint is configured with TypeScript-specific rules to ensure type safety and code quality.

Prettier is configured to enforce a consistent code style:
```json
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "semi": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
```

Note that the codebase uses a no-semicolon style for cleaner and more readable code.

### Testing

nvmx uses Vitest for testing:

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

The test suite covers:
- Unit tests for all modules
- Integration tests for CLI commands
- Type validation tests
- Tests for aliases and version resolution
- Tests for remote version caching
- Tests for shell completion scripts
- Tests for automatic updates

## Contributing

## License

MIT