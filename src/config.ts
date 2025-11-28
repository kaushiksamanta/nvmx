import fs from 'fs'
import path from 'path'
import { NVMX_HOME } from './utils'
import { NvmxConfig, Aliases } from './types'

const DEFAULT_CONFIG: NvmxConfig = {
  mirrorUrl: 'https://nodejs.org/dist',
  cache: {
    maxSize: 1024, // 1GB
    ttl: 30, // 30 days
  },
  aliases: {},
}

// Default TTL for remote versions cache (30 minutes)
const DEFAULT_REMOTE_VERSIONS_CACHE_TTL = 30

const CONFIG_PATH = path.join(NVMX_HOME, 'config.json')

/**
 * Load configuration from config file
 */
export function loadConfig(): NvmxConfig {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const configData = fs.readFileSync(CONFIG_PATH, 'utf8')
      const userConfig = JSON.parse(configData)
      return { ...DEFAULT_CONFIG, ...userConfig }
    }
  } catch (error) {
    console.error('Error loading config:', error)
  }

  return DEFAULT_CONFIG
}

/**
 * Save configuration to config file
 */
export function saveConfig(config: Partial<NvmxConfig>): void {
  try {
    const currentConfig = loadConfig()
    const newConfig = { ...currentConfig, ...config }

    if (!fs.existsSync(NVMX_HOME)) {
      fs.mkdirSync(NVMX_HOME, { recursive: true })
    }

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig, null, 2))
  } catch (error) {
    console.error('Error saving config:', error)
    throw new Error(`Failed to save configuration: ${error}`)
  }
}

/**
 * Get the Node.js mirror URL
 */
export function getMirrorUrl(): string {
  return loadConfig().mirrorUrl
}

/**
 * Get the proxy URL if configured
 */
export function getProxyUrl(): string | undefined {
  return loadConfig().proxyUrl
}

/**
 * Get the default Node.js version if configured
 */
export function getDefaultVersion(): string | undefined {
  return loadConfig().defaultVersion
}

/**
 * Set the default Node.js version
 */
export function setDefaultVersion(version: string): void {
  saveConfig({ defaultVersion: version })
}

/**
 * Set the Node.js mirror URL
 */
export function setMirrorUrl(url: string): void {
  saveConfig({ mirrorUrl: url })
}

/**
 * Set the proxy URL
 */
export function setProxyUrl(url: string | undefined): void {
  saveConfig({ proxyUrl: url })
}

/**
 * Get the cache configuration
 */
export function getCacheConfig(): NvmxConfig['cache'] {
  return loadConfig().cache
}

/**
 * Get all aliases
 */
export function getAliases(): Aliases {
  return loadConfig().aliases || {}
}

/**
 * Get a specific alias
 */
export function getAlias(name: string): string | undefined {
  const aliases = getAliases()
  return aliases[name]
}

/**
 * Set an alias for a Node.js version
 */
export function setAlias(name: string, version: string): void {
  const aliases = getAliases()
  aliases[name] = version
  saveConfig({ aliases })
}

/**
 * Remove an alias
 */
export function removeAlias(name: string): boolean {
  const aliases = getAliases()
  if (aliases[name]) {
    delete aliases[name]
    saveConfig({ aliases })
    return true
  }
  return false
}

/**
 * Resolve a version or alias to a version
 */
export function resolveVersionOrAlias(versionOrAlias: string): string {
  const alias = getAlias(versionOrAlias)
  return alias || versionOrAlias
}

/**
 * Get the remote versions cache
 */
export function getRemoteVersionsCache():
  | { versions: string[]; timestamp: number; ttl: number }
  | undefined {
  return loadConfig().remoteVersionsCache
}

/**
 * Set the remote versions cache
 */
export function setRemoteVersionsCache(versions: string[]): void {
  const cache = {
    versions,
    timestamp: Date.now(),
    ttl: DEFAULT_REMOTE_VERSIONS_CACHE_TTL,
  }
  saveConfig({ remoteVersionsCache: cache })
}

/**
 * Check if the remote versions cache is valid
 */
export function isRemoteVersionsCacheValid(): boolean {
  const cache = getRemoteVersionsCache()
  if (!cache) return false

  const { timestamp, ttl } = cache
  const now = Date.now()
  const expirationTime = timestamp + ttl * 60 * 1000 // Convert minutes to milliseconds

  return now < expirationTime
}

/**
 * Set the remote versions cache TTL
 */
export function setRemoteVersionsCacheTTL(ttl: number): void {
  const cache = getRemoteVersionsCache()
  if (cache) {
    cache.ttl = ttl
    saveConfig({ remoteVersionsCache: cache })
  }
}
