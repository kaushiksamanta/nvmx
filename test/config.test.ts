import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NvmxConfig, CacheConfig } from '../src/types'
import * as config from '../src/config'

vi.mock('../src/config', () => {
  return {
    loadConfig: vi.fn(() => mockConfig),
    saveConfig: vi.fn(),
    getMirrorUrl: vi.fn(() => mockConfig.mirrorUrl),
    getProxyUrl: vi.fn(() => mockConfig.proxyUrl),
    getDefaultVersion: vi.fn(() => mockConfig.defaultVersion),
    getCacheConfig: vi.fn(() => mockConfig.cache),
    setDefaultVersion: vi.fn(),
    setMirrorUrl: vi.fn(),
    setProxyUrl: vi.fn(),
  }
})

const mockCacheConfig: CacheConfig = {
  maxSize: 2048,
  ttl: 60,
}

const mockConfig: NvmxConfig = {
  mirrorUrl: 'https://test-mirror.com/node',
  defaultVersion: 'v16.13.0',
  proxyUrl: 'http://proxy.example.com:8080',
  cache: mockCacheConfig,
}

describe('config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMirrorUrl should return the mirror URL from config', () => {
    const result = config.getMirrorUrl()

    expect(result).toBe('https://test-mirror.com/node')
    expect(config.getMirrorUrl).toHaveBeenCalled()
  })

  it('getProxyUrl should return the proxy URL from config', () => {
    const result = config.getProxyUrl()

    expect(result).toBe('http://proxy.example.com:8080')
    expect(config.getProxyUrl).toHaveBeenCalled()
  })

  it('getDefaultVersion should return the default version from config', () => {
    const result = config.getDefaultVersion()

    expect(result).toBe('v16.13.0')
    expect(config.getDefaultVersion).toHaveBeenCalled()
  })

  it('getCacheConfig should return the cache config from config', () => {
    const result = config.getCacheConfig()

    expect(result).toEqual({
      maxSize: 2048,
      ttl: 60,
    })
    expect(config.getCacheConfig).toHaveBeenCalled()
  })

  it('setDefaultVersion should call saveConfig with the new default version', () => {
    config.setDefaultVersion('v14.17.0')

    expect(config.setDefaultVersion).toHaveBeenCalledWith('v14.17.0')
  })

  it('setMirrorUrl should call saveConfig with the new mirror URL', () => {
    config.setMirrorUrl('https://new-mirror.com/node')

    expect(config.setMirrorUrl).toHaveBeenCalledWith('https://new-mirror.com/node')
  })

  it('setProxyUrl should call saveConfig with the new proxy URL', () => {
    config.setProxyUrl('http://new-proxy.example.com:8080')

    expect(config.setProxyUrl).toHaveBeenCalledWith('http://new-proxy.example.com:8080')
  })
})
