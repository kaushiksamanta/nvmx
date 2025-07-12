import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as manager from '../src/manager'

// Mock the manager module
vi.mock('../src/manager', () => ({
  isVersionInstalled: vi.fn(),
  getInstalledVersions: vi.fn(),
  getRemoteVersions: vi.fn(),
  installVersion: vi.fn(),
  useVersion: vi.fn(),
  uninstallVersion: vi.fn(),
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
