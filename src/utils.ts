import fs from 'fs'
import path from 'path'
import os from 'os'
import axios from 'axios'
import tar from 'tar'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import { Version, Arch, Platform, Path, Url } from './types'

const exec = promisify(execCallback)

// Default paths
export const NVMX_HOME = process.env.NVMX_HOME || path.join(os.homedir(), '.nvmx')
export const VERSIONS_DIR = path.join(NVMX_HOME, 'versions')
export const CACHE_DIR = path.join(NVMX_HOME, 'cache')

// Ensure directories exist
export function ensureDirectories(): void {
  ;[NVMX_HOME, VERSIONS_DIR, CACHE_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  })
}

// Get system architecture
export function getArch(): Arch {
  const arch = os.arch()
  switch (arch) {
    case 'x64':
      return 'x64'
    case 'arm64':
      return 'arm64'
    default:
      throw new Error(`Unsupported architecture: ${arch}`)
  }
}

// Get system platform
export function getPlatform(): Platform {
  const platform = os.platform()
  switch (platform) {
    case 'darwin':
      return 'darwin'
    case 'linux':
      return 'linux'
    default:
      throw new Error(`Unsupported platform: ${platform}`)
  }
}

// Normalize version string (add 'v' prefix if missing)
export function normalizeVersion(version: string): Version {
  return version.startsWith('v') ? (version as Version) : (`v${version}` as Version)
}

// Download a file
export async function downloadFile(url: Url, destination: Path): Promise<void> {
  const response = await axios({
    method: 'GET',
    url,
    responseType: 'stream',
  })

  const writer = fs.createWriteStream(destination)

  return new Promise((resolve, reject) => {
    response.data.pipe(writer)

    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}

// Extract a tarball
export async function extractTarball(tarballPath: Path, destination: Path): Promise<void> {
  await tar.extract({
    file: tarballPath,
    cwd: destination,
  })
}

// Get currently active Node.js version
export async function getCurrentVersion(): Promise<Version | null> {
  try {
    const { stdout } = await exec('node --version')
    return stdout.trim() as Version
  } catch (error) {
    return null
  }
}

// Find .nvmxrc or .node-version file in current or parent directories
export function findVersionFile(startDir: Path = process.cwd() as Path): Path | null {
  let currentDir = startDir

  while (currentDir !== path.parse(currentDir).root) {
    const nvmxrcPath = path.join(currentDir, '.nvmxrc')
    const nodeVersionPath = path.join(currentDir, '.node-version')

    if (fs.existsSync(nvmxrcPath)) {
      return nvmxrcPath as Path
    }

    if (fs.existsSync(nodeVersionPath)) {
      return nodeVersionPath as Path
    }

    currentDir = path.dirname(currentDir)
  }

  return null
}

// Read version from .nvmxrc or .node-version file
export function readVersionFile(filePath: Path): Version | null {
  try {
    const version = fs.readFileSync(filePath, 'utf8').trim()
    return version ? normalizeVersion(version) : null
  } catch (error) {
    return null
  }
}

// Execute a shell script
export async function executeShellScript(scriptPath: Path, args: string[] = []): Promise<string> {
  const { stdout, stderr } = await exec(`${scriptPath} ${args.join(' ')}`)

  if (stderr) {
    throw new Error(stderr)
  }

  return stdout.trim()
}
