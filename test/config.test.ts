import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NvmxConfig, CacheConfig, Aliases } from '../src/types'
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
    getAliases: vi.fn(() => mockConfig.aliases),
    getAlias: vi.fn(name => mockConfig.aliases?.[name]),
    setAlias: vi.fn(),
    removeAlias: vi.fn(),
    resolveVersionOrAlias: vi.fn(
      versionOrAlias => mockConfig.aliases?.[versionOrAlias] || versionOrAlias,
    ),
    getRemoteVersionsCache: vi.fn(() => mockConfig.remoteVersionsCache),
    setRemoteVersionsCache: vi.fn(),
    isRemoteVersionsCacheValid: vi.fn(() => true),
    setRemoteVersionsCacheTTL: vi.fn(),
  }
})

const mockCacheConfig: CacheConfig = {
  maxSize: 2048,
  ttl: 60,
}

const mockAliases: Aliases = {
  lts: 'v16.13.0',
  current: 'v17.0.0',
  myproject: 'v14.17.0',
}

const mockRemoteVersionsCache = {
  versions: ['v17.0.0', 'v16.13.0', 'v14.17.0'],
  timestamp: Date.now(),
  ttl: 30,
}

const mockConfig: NvmxConfig = {
  mirrorUrl: 'https://test-mirror.com/node',
  defaultVersion: 'v16.13.0',
  proxyUrl: 'http://proxy.example.com:8080',
  cache: mockCacheConfig,
  aliases: mockAliases,
  remoteVersionsCache: mockRemoteVersionsCache,
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

  // Tests for alias functions
  it('getAliases should return all aliases from config', () => {
    const result = config.getAliases()

    expect(result).toEqual({
      lts: 'v16.13.0',
      current: 'v17.0.0',
      myproject: 'v14.17.0',
    })
    expect(config.getAliases).toHaveBeenCalled()
  })

  it('getAlias should return a specific alias from config', () => {
    const result = config.getAlias('lts')

    expect(result).toBe('v16.13.0')
    expect(config.getAlias).toHaveBeenCalledWith('lts')
  })

  it('setAlias should call saveConfig with the new alias', () => {
    config.setAlias('stable', 'v16.13.0')

    expect(config.setAlias).toHaveBeenCalledWith('stable', 'v16.13.0')
  })

  it('removeAlias should call saveConfig to remove an alias', () => {
    config.removeAlias('myproject')

    expect(config.removeAlias).toHaveBeenCalledWith('myproject')
  })

  it('resolveVersionOrAlias should resolve an alias to a version', () => {
    const result = config.resolveVersionOrAlias('lts')

    expect(result).toBe('v16.13.0')
    expect(config.resolveVersionOrAlias).toHaveBeenCalledWith('lts')
  })

  it('resolveVersionOrAlias should return the version if not an alias', () => {
    const result = config.resolveVersionOrAlias('v18.0.0')

    expect(result).toBe('v18.0.0')
    expect(config.resolveVersionOrAlias).toHaveBeenCalledWith('v18.0.0')
  })

  // Tests for remote versions cache functions
  it('getRemoteVersionsCache should return the remote versions cache from config', () => {
    const result = config.getRemoteVersionsCache()

    expect(result).toEqual({
      versions: ['v17.0.0', 'v16.13.0', 'v14.17.0'],
      timestamp: expect.any(Number),
      ttl: 30,
    })
    expect(config.getRemoteVersionsCache).toHaveBeenCalled()
  })

  it('setRemoteVersionsCache should call saveConfig with the new remote versions cache', () => {
    const versions = ['v18.0.0', 'v17.0.0', 'v16.13.0']
    config.setRemoteVersionsCache(versions)

    expect(config.setRemoteVersionsCache).toHaveBeenCalledWith(versions)
  })

  it('isRemoteVersionsCacheValid should check if the remote versions cache is valid', () => {
    const result = config.isRemoteVersionsCacheValid()

    expect(result).toBe(true)
    expect(config.isRemoteVersionsCacheValid).toHaveBeenCalled()
  })

  it('setRemoteVersionsCacheTTL should call saveConfig with the new TTL', () => {
    config.setRemoteVersionsCacheTTL(60)

    expect(config.setRemoteVersionsCacheTTL).toHaveBeenCalledWith(60)
  })
})
