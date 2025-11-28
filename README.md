# nvmx

A fast, simple Node.js version manager. Written in TypeScript, works on macOS and Linux.

## Install

```bash
curl -o- https://raw.githubusercontent.com/kaushiksamanta/nvmx/main/scripts/install.sh | bash
```

Then add to your shell config (`.bashrc`, `.zshrc`, etc.):

```bash
export NVMX_HOME="$HOME/.nvmx"
export PATH="$NVMX_HOME/bin:$PATH"
source "$NVMX_HOME/bin/nvmx"
```

Restart your terminal and you're good to go.

## Usage

```bash
# Install a version
nvmx install 20
nvmx install 18.19.0
nvmx install lts

# Switch versions
nvmx use 20
nvmx use 18

# See what you have
nvmx list
nvmx current

# See what's available
nvmx ls-remote

# Remove a version
nvmx uninstall 16
```

## Project version files

Drop a `.nvmxrc` or `.node-version` file in your project:

```
20.10.0
```

Then just run `nvmx install` or `nvmx use` without arguments.

## Aliases

```bash
nvmx alias set default 20
nvmx alias set work 18.19.0
nvmx use work
```

## Configuration

```bash
# Use a mirror (useful in China, corporate networks, etc.)
nvmx config set mirror https://npmmirror.com/mirrors/node

# Set up a proxy
nvmx config set proxy http://proxy.company.com:8080
```

## Updating

```bash
nvmx update
```

## Docs

- [Shell Setup](docs/shell-setup.md) - Detailed shell configuration
- [Configuration](docs/configuration.md) - All config options
- [Architecture](docs/architecture.md) - How it works

## License

MIT