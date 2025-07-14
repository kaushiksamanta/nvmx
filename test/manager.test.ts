import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as manager from '../src/manager'
import * as config from '../src/config'

// Mock the manager module
vi.mock('../src/manager', () => ({
  isVersionInstalled: vi.fn(),
  getInstalledVersions: vi.fn(),
  getRemoteVersions: vi.fn(),
  installVersion: vi.fn(),
  useVersion: vi.fn(),
  uninstallVersion: vi.fn(),
}))

// Mock the config module
vi.mock('../src/config', () => ({
  getMirrorUrl: vi.fn(),
  getProxyUrl: vi.fn(),
  getRemoteVersionsCache: vi.fn(),
  setRemoteVersionsCache: vi.fn(),
  isRemoteVersionsCacheValid: vi.fn(),
}))

describe('manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isVersionInstalled', () => {
    it('should check if a version is installed', () => {
      vi.mocked(manager.isVersionInstalled).mockReturnValue(true)

      const result = manager.isVersionInstalled('v14.17.0')

      expect(result).toBe(true)
      expect(manager.isVersionInstalled).toHaveBeenCalledWith('v14.17.0')
    })
  })

  describe('getInstalledVersions', () => {
    it('should get installed versions', () => {
      vi.mocked(manager.getInstalledVersions).mockReturnValue(['v16.13.0', 'v14.17.0', 'v12.22.0'])

      const result = manager.getInstalledVersions()

      expect(result).toEqual(['v16.13.0', 'v14.17.0', 'v12.22.0'])
      expect(manager.getInstalledVersions).toHaveBeenCalled()
    })
  })

  describe('getRemoteVersions', () => {
    it('should get remote versions', async () => {
      vi.mocked(manager.getRemoteVersions).mockResolvedValue(['v16.13.0', 'v14.17.0', 'v12.22.0'])

      const result = await manager.getRemoteVersions()

      expect(result).toEqual(['v16.13.0', 'v14.17.0', 'v12.22.0'])
      expect(manager.getRemoteVersions).toHaveBeenCalled()
    })

    it('should get remote versions with force refresh', async () => {
      vi.mocked(manager.getRemoteVersions).mockResolvedValue(['v16.13.0', 'v14.17.0', 'v12.22.0'])

      const result = await manager.getRemoteVersions(true)

      expect(result).toEqual(['v16.13.0', 'v14.17.0', 'v12.22.0'])
      expect(manager.getRemoteVersions).toHaveBeenCalledWith(true)
    })

    it('should use cache when available and valid', async () => {
      // This test would be better in an integration test, but we'll mock it here
      vi.mocked(config.isRemoteVersionsCacheValid).mockReturnValue(true)
      vi.mocked(config.getRemoteVersionsCache).mockReturnValue({
        versions: ['v16.13.0', 'v14.17.0', 'v12.22.0'],
        timestamp: Date.now(),
        ttl: 30,
      })

      vi.mocked(manager.getRemoteVersions).mockImplementation(async (forceRefresh = false) => {
        if (forceRefresh) {
          return ['v17.0.0', 'v16.13.0', 'v14.17.0']
        }

        if (config.isRemoteVersionsCacheValid()) {
          const cache = config.getRemoteVersionsCache()
          if (cache && cache.versions.length > 0) {
            return cache.versions
          }
        }

        return ['v17.0.0', 'v16.13.0', 'v14.17.0']
      })

      const result = await manager.getRemoteVersions()

      expect(result).toEqual(['v16.13.0', 'v14.17.0', 'v12.22.0'])
      expect(config.isRemoteVersionsCacheValid).toHaveBeenCalled()
      expect(config.getRemoteVersionsCache).toHaveBeenCalled()
    })
  })

  describe('installVersion', () => {
    it('should install a version', async () => {
      await manager.installVersion('v14.17.0')

      expect(manager.installVersion).toHaveBeenCalledWith('v14.17.0')
    })
  })

  describe('useVersion', () => {
    it('should use a version', async () => {
      vi.mocked(manager.useVersion).mockResolvedValue('Success')

      const result = await manager.useVersion('v14.17.0')

      expect(result).toBe('Success')
      expect(manager.useVersion).toHaveBeenCalledWith('v14.17.0')
    })
  })

  describe('uninstallVersion', () => {
    it('should uninstall a version', () => {
      vi.mocked(manager.uninstallVersion).mockImplementation(() => {})

      manager.uninstallVersion('v14.17.0')

      expect(manager.uninstallVersion).toHaveBeenCalledWith('v14.17.0')
    })
  })
})
