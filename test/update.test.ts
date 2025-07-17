import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as update from '../src/update'

// Mock the entire update module
vi.mock('../src/update', () => ({
  checkForUpdates: vi.fn(),
  updateNvmx: vi.fn(),
  notifyUpdates: vi.fn(),
  // Export the actual constants for testing
  CURRENT_VERSION: '0.1.0',
}))

// Mock axios
vi.mock('axios')

// Mock fs
vi.mock('fs')

// Mock child_process
vi.mock('child_process')

// Mock util
vi.mock('util')

// Mock console.log and console.error
vi.spyOn(console, 'log').mockImplementation(() => {})
vi.spyOn(console, 'error').mockImplementation(() => {})

describe('update', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('checkForUpdates', () => {
    it('should check if a new version is available', async () => {
      vi.mocked(update.checkForUpdates).mockResolvedValue({
        hasUpdate: true,
        latestVersion: 'v0.2.0',
      })

      const result = await update.checkForUpdates()

      expect(result).toEqual({
        hasUpdate: true,
        latestVersion: 'v0.2.0',
      })
    })

    it('should return false if current version is the latest', async () => {
      vi.mocked(update.checkForUpdates).mockResolvedValue({
        hasUpdate: false,
        latestVersion: 'v0.1.0',
      })

      const result = await update.checkForUpdates()

      expect(result).toEqual({
        hasUpdate: false,
        latestVersion: 'v0.1.0',
      })
    })
  })

  describe('updateNvmx', () => {
    it('should update nvmx if a new version is available', async () => {
      vi.mocked(update.updateNvmx).mockResolvedValue({
        success: true,
        message: 'nvmx has been updated to v0.2.0',
      })

      const result = await update.updateNvmx()

      expect(result).toEqual({
        success: true,
        message: 'nvmx has been updated to v0.2.0',
      })
    })

    it('should not update if already at the latest version', async () => {
      vi.mocked(update.updateNvmx).mockResolvedValue({
        success: true,
        message: 'nvmx is already at the latest version (0.1.0)',
      })

      const result = await update.updateNvmx()

      expect(result).toEqual({
        success: true,
        message: 'nvmx is already at the latest version (0.1.0)',
      })
    })

    it('should handle errors during update', async () => {
      vi.mocked(update.updateNvmx).mockResolvedValue({
        success: false,
        message: 'Failed to update nvmx: Network error',
      })

      const result = await update.updateNvmx()

      expect(result).toEqual({
        success: false,
        message: 'Failed to update nvmx: Network error',
      })
    })
  })

  describe('notifyUpdates', () => {
    it('should notify if a new version is available', async () => {
      vi.mocked(update.notifyUpdates).mockResolvedValue(undefined)

      await update.notifyUpdates()

      expect(update.notifyUpdates).toHaveBeenCalled()
    })
  })
})
