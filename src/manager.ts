import fs from 'fs'
import path from 'path'
import axios from 'axios'
import semver from 'semver'
import {
  VERSIONS_DIR,
  CACHE_DIR,
  ensureDirectories,
  normalizeVersion,
  getArch,
  getPlatform,
  downloadFile,
  extractTarball,
  executeShellScript,
} from './utils'
import {
  getMirrorUrl,
  getProxyUrl,
  getRemoteVersionsCache,
  setRemoteVersionsCache,
  isRemoteVersionsCacheValid,
} from './config'
import { Path, Url, InstalledVersions, RemoteVersions } from './types'

/**
 * Check if a specific Node.js version is installed
 */
export function isVersionInstalled(version: string): boolean {
  const normalizedVersion = normalizeVersion(version)
  const versionDir = path.join(VERSIONS_DIR, normalizedVersion)
  return fs.existsSync(versionDir) && fs.existsSync(path.join(versionDir, 'bin', 'node'))
}

/**
 * Get a list of all installed Node.js versions
 */
export function getInstalledVersions(): InstalledVersions {
  ensureDirectories()

  try {
    return fs
      .readdirSync(VERSIONS_DIR)
      .filter(dir => {
        const versionDir = path.join(VERSIONS_DIR, dir)
        return (
          fs.statSync(versionDir).isDirectory() &&
          fs.existsSync(path.join(versionDir, 'bin', 'node'))
        )
      })
      .sort((a, b) => {
        // Sort versions in descending order (newest first)
        return semver.compare(b, a)
      }) as InstalledVersions
  } catch (error) {
    console.error('Error reading installed versions:', error)
    return []
  }
}

/**
 * Get a list of available Node.js versions from the remote server
 * Uses cache if available and valid
 */
export async function getRemoteVersions(forceRefresh = false): Promise<RemoteVersions> {
  try {
    // Check if we have a valid cache and should use it
    if (!forceRefresh && isRemoteVersionsCacheValid()) {
      const cache = getRemoteVersionsCache()
      if (cache && cache.versions.length > 0) {
        return cache.versions as RemoteVersions
      }
    }

    // If no valid cache or force refresh, fetch from remote
    const mirrorUrl = getMirrorUrl()
    const proxyUrl = getProxyUrl()

    // Define proper types for axios request config
    interface AxiosRequestConfig {
      proxy?: {
        protocol: string
        host: string
        port: number
      }
    }

    // Create request config
    const config: AxiosRequestConfig = {}
    if (proxyUrl) {
      // Convert string proxy URL to axios proxy config
      config.proxy = {
        protocol: proxyUrl.startsWith('https') ? 'https' : 'http',
        host: new URL(proxyUrl).hostname,
        port: parseInt(new URL(proxyUrl).port, 10) || (proxyUrl.startsWith('https') ? 443 : 80),
      }
    }

    console.log('Fetching available Node.js versions from remote server...')
    const response = await axios.get(`${mirrorUrl}/index.json`, config)

    // Define proper type for Node.js release
    interface NodeReleaseInfo {
      version: string
      date: string
      files: string[]
      npm?: string
      v8?: string
      lts?: string | boolean
      security?: boolean
    }

    const versions = response.data
      .map((release: NodeReleaseInfo) => release.version)
      .filter((version: string) => semver.valid(version))
      .sort((a: string, b: string) => semver.compare(b, a)) // Sort in descending order

    // Cache the results
    setRemoteVersionsCache(versions)

    return versions as RemoteVersions
  } catch (error) {
    // If fetching fails, try to use cache even if expired
    const cache = getRemoteVersionsCache()
    if (cache && cache.versions.length > 0) {
      console.warn('Failed to fetch from remote, using cached versions (may be outdated)')
      return cache.versions as RemoteVersions
    }

    console.error('Error fetching remote versions:', error)
    throw new Error(`Failed to fetch available Node.js versions: ${error}`)
  }
}

/**
 * Install a specific Node.js version
 */
export async function installVersion(version: string): Promise<void> {
  const normalizedVersion = normalizeVersion(version)

  if (isVersionInstalled(normalizedVersion)) {
    console.log(`Node.js ${normalizedVersion} is already installed`)
    return
  }

  ensureDirectories()

  const versionNumber = normalizedVersion.replace(/^v/, '')
  const arch = getArch()
  const platform = getPlatform()
  const mirrorUrl = getMirrorUrl()

  const tarballName = `node-v${versionNumber}-${platform}-${arch}.tar.gz`
  const downloadUrl = `${mirrorUrl}/v${versionNumber}/${tarballName}` as Url
  const tarballPath = path.join(CACHE_DIR, tarballName) as Path

  try {
    console.log(`Downloading Node.js ${normalizedVersion} for ${platform}-${arch}...`)
    await downloadFile(downloadUrl, tarballPath)

    const versionDir = path.join(VERSIONS_DIR, normalizedVersion)
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir, { recursive: true })
    }

    console.log(`Extracting Node.js ${normalizedVersion}...`)
    const extractDir = path.join(CACHE_DIR, `node-v${versionNumber}-${platform}-${arch}`)
    await extractTarball(tarballPath, CACHE_DIR)

    // Copy files from extracted directory to version directory
    fs.cpSync(extractDir, versionDir, { recursive: true })

    // Clean up
    fs.rmSync(extractDir, { recursive: true, force: true })

    console.log(`Node.js ${normalizedVersion} has been installed successfully`)
  } catch (error) {
    console.error(`Error installing Node.js ${normalizedVersion}:`, error)
    throw new Error(`Failed to install Node.js ${normalizedVersion}: ${error}`)
  }
}

/**
 * Use a specific Node.js version by executing the use.sh script
 */
export async function useVersion(version: string): Promise<string> {
  const normalizedVersion = normalizeVersion(version)

  if (!isVersionInstalled(normalizedVersion)) {
    throw new Error(
      `Node.js ${normalizedVersion} is not installed. Install it first with: nvmx install ${normalizedVersion}`,
    )
  }

  try {
    const scriptPath = path.resolve(__dirname, '..', 'scripts', 'use.sh') as Path
    return await executeShellScript(scriptPath, [normalizedVersion])
  } catch (error) {
    console.error(`Error using Node.js ${normalizedVersion}:`, error)
    throw new Error(`Failed to use Node.js ${normalizedVersion}: ${error}`)
  }
}

/**
 * Uninstall a specific Node.js version
 */
export function uninstallVersion(version: string): void {
  const normalizedVersion = normalizeVersion(version)
  const versionDir = path.join(VERSIONS_DIR, normalizedVersion)

  if (!isVersionInstalled(normalizedVersion)) {
    throw new Error(`Node.js ${normalizedVersion} is not installed`)
  }

  try {
    fs.rmSync(versionDir, { recursive: true, force: true })
    console.log(`Node.js ${normalizedVersion} has been uninstalled successfully`)
  } catch (error) {
    console.error(`Error uninstalling Node.js ${normalizedVersion}:`, error)
    throw new Error(`Failed to uninstall Node.js ${normalizedVersion}: ${error}`)
  }
}
