# Configuration

All configuration is stored in `~/.nvmx/config.json`.

## Mirror URL

Use a different Node.js distribution mirror:

```bash
nvmx config set mirror https://npmmirror.com/mirrors/node
nvmx config get mirror
```

## Proxy

For corporate networks:

```bash
nvmx config set proxy http://proxy.company.com:8080
nvmx config get proxy
nvmx config set proxy ""  # Remove proxy
```

## Default Version

Set a default version to use when no `.nvmxrc` is present:

```bash
nvmx config set default v20.10.0
nvmx config get default
```

## Cache Settings

Control how long remote version lists are cached:

```bash
nvmx cache ttl 60  # Cache for 60 minutes
nvmx cache clear   # Clear the cache
```

## Aliases

Create shortcuts for versions you use often:

```bash
nvmx alias set prod v18.19.0
nvmx alias set dev v21.5.0
nvmx use prod
nvmx alias list
nvmx alias remove prod
```

## Version Files

nvmx looks for version files in the current directory and parents:

- `.nvmxrc` - nvmx-specific
- `.node-version` - Compatible with other version managers

Just put a version number in the file:

```
v20.10.0
```

Or without the `v`:

```
20.10.0
```
