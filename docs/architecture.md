# Architecture

nvmx is built with TypeScript and follows a modular design.

## Project Structure

```
nvmx/
├── bin/nvmx          # Shell wrapper (handles PATH modifications)
├── src/
│   ├── cli.ts        # Command definitions (commander.js)
│   ├── manager.ts    # Core version management logic
│   ├── config.ts     # Configuration handling
│   ├── utils.ts      # Helper functions
│   ├── update.ts     # Auto-update functionality
│   ├── completions.ts # Shell completion scripts
│   └── types/        # TypeBox schemas & TypeScript types
├── scripts/
│   ├── install.sh    # Installation script
│   └── use.sh        # Version switching helper
└── test/             # Vitest test suites
```

## How It Works

### Version Switching

The tricky part of any version manager is modifying the shell's PATH. Since child processes can't modify parent environment variables, nvmx uses a shell wrapper approach:

1. `bin/nvmx` is a POSIX shell script that sources into your shell
2. For `use` and `shell` commands, it modifies PATH directly
3. Other commands delegate to the compiled Node.js CLI

### Storage Layout

```
~/.nvmx/
├── versions/         # Installed Node.js versions
│   ├── v18.19.0/
│   └── v20.10.0/
├── cache/            # Downloaded tarballs
└── config.json       # User configuration
```

## Type System

We use [TypeBox](https://github.com/sinclairzx81/typebox) for runtime type validation. Types are defined once and used for both TypeScript compilation and runtime checks.

Key types in `src/types/`:
- `common.ts` - Version, Path, Url, Platform, Arch
- `config.ts` - Configuration schema
- `manager.ts` - Installation results, version lists
- `cli.ts` - Command argument types

## Configuration

Config is stored in `~/.nvmx/config.json`:

```json
{
  "mirrorUrl": "https://nodejs.org/dist",
  "proxyUrl": "http://proxy.example.com:8080",
  "defaultVersion": "v20.10.0",
  "aliases": {
    "default": "v20.10.0",
    "lts": "v18.19.0"
  },
  "cache": {
    "maxSize": 1024,
    "ttl": 30
  }
}
```

## Remote Version Caching

To avoid hammering nodejs.org, remote version lists are cached for 30 minutes by default. The cache includes a timestamp and TTL, so stale data is refreshed automatically.
