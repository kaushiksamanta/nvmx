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
} from './config'
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
  .command('install [version]')
  .description('Install a specific Node.js version')
  .action(async (version?: string) => {
    try {
      ensureDirectories()

      if (!version) {
        // If no version specified, try to read from .nvmxrc or .node-version
        const versionFile = findVersionFile()
        if (versionFile) {
          const fileVersion = readVersionFile(versionFile)
          if (fileVersion) {
            version = fileVersion
            console.log(`Using version ${version} from ${versionFile}`)
          }
        }

        // If still no version, use default or latest
        if (!version) {
          version = getDefaultVersion()
          if (!version) {
            console.log('No version specified, installing latest LTS version...')
            const versions = await getRemoteVersions()
            version = versions.find(v => v.includes('lts')) || versions[0]
          }
        }
      }

      await installVersion(version)
    } catch (error) {
      console.error('Error:', error)
      process.exit(1)
    }
  })

// Use command
program
  .command('use [version]')
  .description('Use a specific Node.js version')
  .action(async (version?: string) => {
    try {
      if (!version) {
        // If no version specified, try to read from .nvmxrc or .node-version
        const versionFile = findVersionFile()
        if (versionFile) {
          const fileVersion = readVersionFile(versionFile)
          if (fileVersion) {
            version = fileVersion
            console.log(`Using version ${version} from ${versionFile}`)
          }
        }

        // If still no version, use default
        if (!version) {
          version = getDefaultVersion()
          if (!version) {
            console.error('No version specified and no default version set')
            process.exit(1)
          }
        }
      }

      // This command is handled by the shell script in bin/nvmx
      // Here we just validate the version
      const normalizedVersion = normalizeVersion(version)
      if (!isVersionInstalled(normalizedVersion)) {
        console.error(
          `Node.js ${normalizedVersion} is not installed. Install it first with: nvmx install ${normalizedVersion}`,
        )
        process.exit(1)
      }

      console.log(
        `To use Node.js ${normalizedVersion}, run: eval "$(nvmx use ${normalizedVersion})"`,
      )
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
  .action(async () => {
    try {
      console.log('Fetching available Node.js versions...')
      const versions = await getRemoteVersions()

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

// Parse command line arguments
program.parse(process.argv)

// If no arguments provided, show help
if (process.argv.length === 2) {
  program.help()
}
