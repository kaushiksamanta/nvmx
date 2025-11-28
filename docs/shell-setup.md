# Shell Setup

After installation, add nvmx to your shell configuration.

## Bash

Add to `~/.bashrc`:

```bash
export NVMX_HOME="$HOME/.nvmx"
export PATH="$NVMX_HOME/bin:$PATH"
source "$NVMX_HOME/bin/nvmx"
```

For completions, add:

```bash
eval "$(nvmx completions bash)"
```

## Zsh

Add to `~/.zshrc`:

```zsh
export NVMX_HOME="$HOME/.nvmx"
export PATH="$NVMX_HOME/bin:$PATH"
source "$NVMX_HOME/bin/nvmx"
```

For completions:

```zsh
eval "$(nvmx completions zsh)"
```

## Fish

Add to `~/.config/fish/config.fish`:

```fish
set -gx NVMX_HOME $HOME/.nvmx
set -gx PATH $NVMX_HOME/bin $PATH
source $NVMX_HOME/bin/nvmx
```

For completions:

```fish
nvmx completions fish | source
```

## Verifying Installation

After restarting your shell:

```bash
nvmx --version
nvmx list-remote | head -10
```
