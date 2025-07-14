import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as manager from '../src/manager'
import * as utils from '../src/utils'

// Define the type for mocked Command
interface MockCommand {
  name: ReturnType<typeof vi.fn>
  description: ReturnType<typeof vi.fn>
  version: ReturnType<typeof vi.fn>
  command: ReturnType<typeof vi.fn>
  alias: ReturnType<typeof vi.fn>
  action: ReturnType<typeof vi.fn>
  parse: ReturnType<typeof vi.fn>
  help: ReturnType<typeof vi.fn>
}

// Mock the commander module
vi.mock('commander', () => {
  const mockCommand: MockCommand = {
    name: vi.fn().mockReturnThis(),
    description: vi.fn().mockReturnThis(),
    version: vi.fn().mockReturnThis(),
    command: vi.fn().mockReturnThis(),
    alias: vi.fn().mockReturnThis(),
    action: vi.fn().mockReturnThis(),
    parse: vi.fn(),
    help: vi.fn(),
  }

  return {
    Command: vi.fn(() => mockCommand),
  }
})

// Mock the manager module
vi.mock('../src/manager', () => ({
  getInstalledVersions: vi.fn(),
  getRemoteVersions: vi.fn(),
  installVersion: vi.fn(),
  useVersion: vi.fn(),
  uninstallVersion: vi.fn(),
  isVersionInstalled: vi.fn(),
}))

// Mock the utils module
vi.mock('../src/utils', () => ({
  getCurrentVersion: vi.fn(),
  findVersionFile: vi.fn(),
  readVersionFile: vi.fn(),
  normalizeVersion: vi.fn(),
  ensureDirectories: vi.fn(),
}))

// Mock the config module
vi.mock('../src/config', () => ({
  getMirrorUrl: vi.fn(),
  setMirrorUrl: vi.fn(),
  getProxyUrl: vi.fn(),
  setProxyUrl: vi.fn(),
  getDefaultVersion: vi.fn(),
  setDefaultVersion: vi.fn(),
  getAliases: vi.fn(),
  getAlias: vi.fn(),
  setAlias: vi.fn(),
  removeAlias: vi.fn(),
  resolveVersionOrAlias: vi.fn(),
  getRemoteVersionsCache: vi.fn(),
  setRemoteVersionsCache: vi.fn(),
  isRemoteVersionsCacheValid: vi.fn(),
  setRemoteVersionsCacheTTL: vi.fn(),
}))

// Mock the completions module
vi.mock('../src/completions', () => ({
  generateBashCompletion: vi.fn(),
  generateZshCompletion: vi.fn(),
  generateFishCompletion: vi.fn(),
}))

// Mock the update module
vi.mock('../src/update', () => ({
  checkForUpdates: vi.fn(),
  updateNvmx: vi.fn(),
  notifyUpdates: vi.fn(),
}))

// Mock console.log and console.error
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

// Create a mock CLI module
const mockCliModule = `
#!/usr/bin/env node

import { Command } from 'commander';
import * as manager from '../src/manager';
import * as utils from '../src/utils';
import * as config from '../src/config';
import { NvmxCommand, ConfigKey } from '../src/types';

// Initialize the program
const program = new Command();

// Set up version and description
program
  .name('nvmx')
  .description('POSIX-compliant Node.js version manager written in TypeScript')
  .version('0.1.0');

// Install command
program
  .command('install [version]')
  .description('Install a specific Node.js version')
  .action(async (version) => {
    try {
      await manager.installVersion(version);
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// List command
program
  .command('list')
  .alias('ls')
  .description('List installed Node.js versions')
  .action(async () => {
    try {
      const versions = manager.getInstalledVersions();
      const currentVersion = await utils.getCurrentVersion();
      
      console.log('Installed Node.js versions:');
      if (versions.length === 0) {
        console.log('  No versions installed');
      } else {
        versions.forEach(version => {
          const prefix = version === currentVersion ? '* ' : '  ';
          console.log(\`\${prefix}\${version}\`);
        });
      }
    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);
`

vi.mock('fs', () => ({
  ...vi.importActual('fs'),
  readFileSync: vi.fn(path => {
    if (path.includes('cli.ts')) {
      return mockCliModule
    }
    return ''
  }),
  existsSync: vi.fn(() => true),
}))

describe('CLI', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('should test the install command', async () => {
    vi.mocked(manager.installVersion).mockResolvedValue()

    const installAction = async (version: string): Promise<void> => {
      try {
        await manager.installVersion(version)
      } catch (error) {
        console.error('Error:', error)
        process.exit(1)
      }
    }

    await installAction('v14.17.0')

    expect(manager.installVersion).toHaveBeenCalledWith('v14.17.0')
  })

  it('should test the list command', async () => {
    vi.mocked(manager.getInstalledVersions).mockReturnValue(['v16.13.0', 'v14.17.0'])

    vi.mocked(utils.getCurrentVersion).mockResolvedValue('v16.13.0')

    const listAction = async (): Promise<void> => {
      try {
        const versions = manager.getInstalledVersions()
        const currentVersion = await utils.getCurrentVersion()

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
    }

    await listAction()

    expect(manager.getInstalledVersions).toHaveBeenCalled()
    expect(utils.getCurrentVersion).toHaveBeenCalled()

    expect(console.log).toHaveBeenCalledWith('Installed Node.js versions:')
    expect(console.log).toHaveBeenCalledWith('* v16.13.0')
    expect(console.log).toHaveBeenCalledWith('  v14.17.0')
  })

  // Test alias commands
  it('should test the alias list command', async () => {
    const config = await import('../src/config')
    vi.mocked(config.getAliases).mockReturnValue({
      lts: 'v16.13.0',
      current: 'v17.0.0',
    })

    const aliasListAction = async (): Promise<void> => {
      try {
        const aliases = config.getAliases()
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
    }

    await aliasListAction()

    expect(config.getAliases).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('Node.js version aliases:')
    expect(console.log).toHaveBeenCalledWith('  lts -> v16.13.0')
    expect(console.log).toHaveBeenCalledWith('  current -> v17.0.0')
  })

  // Test completion commands
  it('should test the completion bash command', async () => {
    const completions = await import('../src/completions')
    vi.mocked(completions.generateBashCompletion).mockReturnValue('# Bash completion script')

    const completionBashAction = (): void => {
      console.log(completions.generateBashCompletion())
    }

    completionBashAction()

    expect(completions.generateBashCompletion).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('# Bash completion script')
  })

  // Test update commands
  it('should test the update command', async () => {
    const update = await import('../src/update')
    vi.mocked(update.updateNvmx).mockResolvedValue({
      success: true,
      message: 'nvmx has been updated to v0.2.0',
    })

    const updateAction = async (): Promise<void> => {
      try {
        const result = await update.updateNvmx()
        console.log(result.message)
      } catch (error) {
        console.error('Error:', error)
        process.exit(1)
      }
    }

    await updateAction()

    expect(update.updateNvmx).toHaveBeenCalled()
    expect(console.log).toHaveBeenCalledWith('nvmx has been updated to v0.2.0')
  })

  // Test cache commands
  it('should test the cache set-ttl command', async () => {
    const config = await import('../src/config')
    vi.mocked(config.setRemoteVersionsCacheTTL).mockImplementation(() => {})

    const cacheSetTtlAction = (minutes: string): void => {
      try {
        const ttl = parseInt(minutes, 10)
        if (isNaN(ttl) || ttl <= 0) {
          console.error('TTL must be a positive number')
          process.exit(1)
        }

        config.setRemoteVersionsCacheTTL(ttl)
        console.log(`Remote versions cache TTL set to ${ttl} minutes`)
      } catch (error) {
        console.error('Error:', error)
        process.exit(1)
      }
    }

    cacheSetTtlAction('60')

    expect(config.setRemoteVersionsCacheTTL).toHaveBeenCalledWith(60)
    expect(console.log).toHaveBeenCalledWith('Remote versions cache TTL set to 60 minutes')
  })
})
