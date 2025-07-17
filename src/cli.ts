#!/usr/bin/env node

import { Command } from 'commander'
import {
  getInstalledVersions,
  getRemoteVersions,
  installVersion,
  uninstallVersion,
  isVersionInstalled,
} from './manager'
import {
  getCurrentVersion,
  findVersionFile,
  readVersionFile,
  normalizeVersion,
  ensureDirectories,
} from './utils'
import {
  getMirrorUrl,
  setMirrorUrl,
  getProxyUrl,
  setProxyUrl,
  getDefaultVersion,
  setDefaultVersion,
  getAliases,
  getAlias,
  setAlias,
  removeAlias,
  resolveVersionOrAlias,
  setRemoteVersionsCache,
  setRemoteVersionsCacheTTL,
} from './config'
import {
  generateBashCompletion,
  generateZshCompletion,
  generateFishCompletion,
} from './completions'
import { checkForUpdates, updateNvmx, notifyUpdates } from './update'
import { ConfigKey } from './types'

// Initialize the program
const program = new Command()

// Set up version and description
program
  .name('nvmx')
  .description('POSIX-compliant Node.js version manager written in TypeScript')
  .version('0.1.0')

// Install command
program
  .command('install [versionOrAlias]')
  .description('Install a specific Node.js version or alias')
  .action(async (versionOrAlias?: string) => {
    try {
      ensureDirectories()

      if (!versionOrAlias) {
        // If no version specified, try to read from .nvmxrc or .node-version
        const versionFile = findVersionFile()
        if (versionFile) {
          const fileVersion = readVersionFile(versionFile)
          if (fileVersion) {
            versionOrAlias = fileVersion
            console.log(`Using version ${versionOrAlias} from ${versionFile}`)
          }
        }

        // If still no version, use default or latest
        if (!versionOrAlias) {
          versionOrAlias = getDefaultVersion()
          if (!versionOrAlias) {
            console.log('No version specified, installing latest LTS version...')
            const versions = await getRemoteVersions()
            versionOrAlias = versions.find(v => v.includes('lts')) || versions[0]
          }
        }
      }

      // Resolve alias to actual version if it's an alias
      const resolvedVersion = resolveVersionOrAlias(versionOrAlias)
      await installVersion(resolvedVersion)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Use command
program
  .command('use [versionOrAlias]')
  .description('Use a specific Node.js version or alias')
  .action(async (versionOrAlias?: string) => {
    try {
      if (!versionOrAlias) {
        // If no version specified, try to read from .nvmxrc or .node-version
        const versionFile = findVersionFile()
        if (versionFile) {
          const fileVersion = readVersionFile(versionFile)
          if (fileVersion) {
            versionOrAlias = fileVersion
            console.log(`Using version ${versionOrAlias} from ${versionFile}`)
          }
        }

        // If still no version, use default
        if (!versionOrAlias) {
          versionOrAlias = getDefaultVersion()
          if (!versionOrAlias) {
            console.error('No version specified and no default version set')
            process.exit(1)
          }
        }
      }

      // Resolve alias to actual version if it's an alias
      const resolvedVersion = resolveVersionOrAlias(versionOrAlias)

      // This command is handled by the shell script in bin/nvmx
      // Here we just validate the version
      const normalizedVersion = normalizeVersion(resolvedVersion)
      if (!isVersionInstalled(normalizedVersion)) {
        console.error(
          `Node.js ${normalizedVersion} is not installed. Install it first with: nvmx install ${normalizedVersion}`,
        )
        process.exit(1)
      }

      console.log(`To use Node.js ${normalizedVersion}, run: eval "$(nvmx use ${versionOrAlias})"`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// List command
program
  .command('list')
  .alias('ls')
  .description('List installed Node.js versions')
  .action(async () => {
    try {
      const versions = getInstalledVersions()
      const currentVersion = await getCurrentVersion()

      console.log('Installed Node.js versions:')
      if (versions.length === 0) {
        console.log('  No versions installed')
      } else {
        versions.forEach(version => {
          const prefix = version === currentVersion ? '* ' : '  '
          console.log(`${prefix}${version}`)
        })
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// List remote versions command
program
  .command('ls-remote')
  .description('List available Node.js versions from the remote server')
  .option('-f, --force', 'Force refresh the cache')
  .action(async options => {
    try {
      const forceRefresh = options.force || false
      const versions = await getRemoteVersions(forceRefresh)

      console.log('Available Node.js versions:')
      versions.slice(0, 20).forEach(version => {
        console.log(`  ${version}`)
      })

      if (versions.length > 20) {
        console.log(`  ... and ${versions.length - 20} more`)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Cache commands
const cacheCommand = program.command('cache').description('Manage nvmx cache')

// Set remote versions cache TTL
cacheCommand
  .command('set-ttl <minutes>')
  .description('Set the time-to-live for remote versions cache in minutes')
  .action((minutes: string) => {
    try {
      const ttl = parseInt(minutes, 10)
      if (isNaN(ttl) || ttl <= 0) {
        console.error('TTL must be a positive number')
        process.exit(1)
      }

      setRemoteVersionsCacheTTL(ttl)
      console.log(`Remote versions cache TTL set to ${ttl} minutes`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Clear remote versions cache
cacheCommand
  .command('clear-remote')
  .description('Clear the remote versions cache')
  .action(() => {
    try {
      setRemoteVersionsCache([])
      console.log('Remote versions cache cleared')
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Current command
program
  .command('current')
  .description('Show the currently active Node.js version')
  .action(async () => {
    try {
      const currentVersion = await getCurrentVersion()

      if (currentVersion) {
        console.log(`Current Node.js version: ${currentVersion}`)
      } else {
        console.log('No Node.js version is currently active')
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Uninstall command
program
  .command('uninstall <version>')
  .alias('remove')
  .description('Uninstall a specific Node.js version')
  .action((version: string) => {
    try {
      uninstallVersion(version)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Config commands
const configCommand = program.command('config').description('Manage nvmx configuration')

configCommand
  .command('get <key>')
  .description('Get a configuration value')
  .action((key: ConfigKey) => {
    try {
      switch (key) {
        case 'mirror':
          console.log(`Mirror URL: ${getMirrorUrl()}`)
          break
        case 'proxy':
          const proxyUrl = getProxyUrl()
          console.log(`Proxy URL: ${proxyUrl || 'Not set'}`)
          break
        case 'default':
          const defaultVersion = getDefaultVersion()
          console.log(`Default version: ${defaultVersion || 'Not set'}`)
          break
        default:
          console.error(`Unknown configuration key: ${key}`)
          process.exit(1)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

configCommand
  .command('set <key> <value>')
  .description('Set a configuration value')
  .action((key: ConfigKey, value: string) => {
    try {
      switch (key) {
        case 'mirror':
          setMirrorUrl(value)
          console.log(`Mirror URL set to: ${value}`)
          break
        case 'proxy':
          setProxyUrl(value === 'none' ? undefined : value)
          console.log(`Proxy URL set to: ${value === 'none' ? 'Not set' : value}`)
          break
        case 'default':
          setDefaultVersion(value)
          console.log(`Default version set to: ${value}`)
          break
        default:
          console.error(`Unknown configuration key: ${key}`)
          process.exit(1)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Shell command
program
  .command('shell')
  .description('Output shell integration code')
  .action(() => {
    // This command is handled by the shell script in bin/nvmx
    // We need to exit the Node.js process to let the shell script handle it
    console.log('This command should be run as: eval "$(nvmx shell)"')
    process.exit(0) // Exit with success code to let the shell script handle it
  })

// Alias commands
const aliasCommand = program.command('alias').description('Manage Node.js version aliases')

// List all aliases
aliasCommand
  .command('list')
  .alias('ls')
  .description('List all aliases')
  .action(() => {
    try {
      const aliases = getAliases()
      const aliasEntries = Object.entries(aliases)

      console.log('Node.js version aliases:')
      if (aliasEntries.length === 0) {
        console.log('  No aliases configured')
      } else {
        aliasEntries.forEach(([name, version]) => {
          console.log(`  ${name} -> ${version}`)
        })
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Set an alias
aliasCommand
  .command('set <name> <version>')
  .description('Set an alias for a Node.js version')
  .action((name: string, version: string) => {
    try {
      // Normalize and validate the version
      const normalizedVersion = normalizeVersion(version)

      // Check if the version is installed
      if (!isVersionInstalled(normalizedVersion)) {
        console.error(
          `Node.js ${normalizedVersion} is not installed. Install it first with: nvmx install ${normalizedVersion}`,
        )
        process.exit(1)
      }

      setAlias(name, normalizedVersion)
      console.log(`Alias '${name}' set to Node.js ${normalizedVersion}`)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Remove an alias
aliasCommand
  .command('rm <name>')
  .alias('remove')
  .description('Remove an alias')
  .action((name: string) => {
    try {
      if (removeAlias(name)) {
        console.log(`Alias '${name}' removed`)
      } else {
        console.error(`Alias '${name}' not found`)
        process.exit(1)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Update command
program
  .command('update')
  .description('Update nvmx to the latest version')
  .action(async () => {
    try {
      const result = await updateNvmx()
      console.log(result.message)

      if (!result.success) {
        process.exit(1)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Check for updates command
program
  .command('check-update')
  .description('Check if a new version of nvmx is available')
  .action(async () => {
    try {
      const { hasUpdate, latestVersion } = await checkForUpdates()

      if (hasUpdate) {
        console.log(`A new version of nvmx is available: ${latestVersion}`)
        console.log('Run "nvmx update" to update to the latest version')
      } else {
        console.log(`nvmx is up to date (${latestVersion})`)
      }
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Completion command
const completionCommand = program
  .command('completion')
  .description('Generate shell completion scripts')

completionCommand
  .command('bash')
  .description('Generate Bash completion script')
  .action(() => {
    console.log(generateBashCompletion())
  })

completionCommand
  .command('zsh')
  .description('Generate Zsh completion script')
  .action(() => {
    console.log(generateZshCompletion())
  })

completionCommand
  .command('fish')
  .description('Generate Fish completion script')
  .action(() => {
    console.log(generateFishCompletion())
  })

// Parse command line arguments
program.parse(process.argv)

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.help()
}

// Check for updates in the background (don't await)
// This will notify the user if a new version is available
// but won't block the execution of the command
if (
  process.argv.length > 2 &&
  !['update', 'check-update', 'completion'].includes(process.argv[2])
) {
  notifyUpdates().catch(() => {
    // Silently fail - we don't want to interrupt normal operation
  })
}
