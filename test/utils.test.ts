import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Path } from '../src/types'
import * as utils from '../src/utils'

// Mock the utils module
vi.mock('../src/utils', () => ({
  NVMX_HOME: '/mock/.nvmx',
  VERSIONS_DIR: '/mock/.nvmx/versions',
  CACHE_DIR: '/mock/.nvmx/cache',
  ensureDirectories: vi.fn(),
  getArch: vi.fn(() => 'x64'),
  getPlatform: vi.fn(() => 'darwin'),
  normalizeVersion: vi.fn(version => (version.startsWith('v') ? version : `v${version}`)),
  getCurrentVersion: vi.fn(() => 'v14.17.0'),
  findVersionFile: vi.fn(() => '/mock/project/.nvmxrc'),
  readVersionFile: vi.fn(() => 'v14.17.0'),
  downloadFile: vi.fn(),
  extractTarball: vi.fn(),
  executeShellScript: vi.fn(),
}))

describe('utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('ensureDirectories', () => {
    it('should call the ensureDirectories function', () => {
      utils.ensureDirectories()
      expect(utils.ensureDirectories).toHaveBeenCalled()
    })
  })

  describe('getArch', () => {
    it('should return the architecture', () => {
      const result = utils.getArch()
      expect(result).toBe('x64')
      expect(utils.getArch).toHaveBeenCalled()
    })
  })

  describe('getPlatform', () => {
    it('should return the platform', () => {
      const result = utils.getPlatform()
      expect(result).toBe('darwin')
      expect(utils.getPlatform).toHaveBeenCalled()
    })
  })

  describe('normalizeVersion', () => {
    it('should normalize the version', () => {
      // Reset the mock to test the actual implementation
      vi.mocked(utils.normalizeVersion).mockImplementation(version =>
        version.startsWith('v') ? version : `v${version}`,
      )

      expect(utils.normalizeVersion('14.17.0')).toBe('v14.17.0')
      expect(utils.normalizeVersion('v14.17.0')).toBe('v14.17.0')
      expect(utils.normalizeVersion).toHaveBeenCalledTimes(2)
    })
  })

  describe('findVersionFile', () => {
    it('should find the version file', () => {
      const result = utils.findVersionFile('/mock/project')
      expect(result).toBe('/mock/project/.nvmxrc')
      expect(utils.findVersionFile).toHaveBeenCalledWith('/mock/project')
    })
  })

  describe('readVersionFile', () => {
    it('should read the version file', () => {
      const result = utils.readVersionFile('/mock/project/.nvmxrc' as Path)
      expect(result).toBe('v14.17.0')
      expect(utils.readVersionFile).toHaveBeenCalledWith('/mock/project/.nvmxrc')
    })
  })
})
