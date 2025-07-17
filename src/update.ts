import fs from 'fs'
import path from 'path'
import axios from 'axios'
import semver from 'semver'
import { promisify } from 'util'
import { exec as execCallback } from 'child_process'
import { NVMX_HOME } from './utils'

const exec = promisify(execCallback)

// GitHub repository information
const REPO_OWNER = 'kaushiksamanta'
const REPO_NAME = 'nvmx'
const GITHUB_API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`

// Current version (should match package.json)
const CURRENT_VERSION = '0.1.0'

/**
 * Check if a new version is available
 */
export async function checkForUpdates(): Promise<{ hasUpdate: boolean; latestVersion: string }> {
  try {
    // Fetch latest release from GitHub API
    const response = await axios.get(`${GITHUB_API_URL}/releases/latest`)
    const latestVersion = response.data.tag_name.replace(/^v/, '')

    // Compare versions
    const hasUpdate = semver.gt(latestVersion, CURRENT_VERSION)

    return { hasUpdate, latestVersion: `v${latestVersion}` }
  } catch (error) {
    console.error('Error checking for updates:', error)
    return { hasUpdate: false, latestVersion: `v${CURRENT_VERSION}` }
  }
}

/**
 * Update nvmx to the latest version
 */
export async function updateNvmx(): Promise<{ success: boolean; message: string }> {
  try {
    // Check if we have an update
    const { hasUpdate, latestVersion } = await checkForUpdates()

    if (!hasUpdate) {
      return {
        success: true,
        message: `nvmx is already at the latest version (${CURRENT_VERSION})`,
      }
    }

    // Download the install script
    console.log(`Updating nvmx to ${latestVersion}...`)
    const installScriptUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/scripts/install.sh`
    const response = await axios.get(installScriptUrl)

    // Save the install script to a temporary file
    const tempScriptPath = path.join(NVMX_HOME, 'update.sh')
    fs.writeFileSync(tempScriptPath, response.data)
    fs.chmodSync(tempScriptPath, '755') // Make executable

    // Execute the install script
    console.log('Executing update script...')
    await exec(`${tempScriptPath} --update`)

    // Clean up
    fs.unlinkSync(tempScriptPath)

    return {
      success: true,
      message: `nvmx has been updated to ${latestVersion}`,
    }
  } catch (error) {
    console.error('Error updating nvmx:', error)
    return {
      success: false,
      message: `Failed to update nvmx: ${error}`,
    }
  }
}

/**
 * Check for updates and notify if available
 */
export async function notifyUpdates(): Promise<void> {
  try {
    const { hasUpdate, latestVersion } = await checkForUpdates()

    if (hasUpdate) {
      console.log(`\nA new version of nvmx is available: ${latestVersion}`)
      console.log('Run "nvmx update" to update to the latest version\n')
    }
  } catch (error) {
    // Silently fail - we don't want to interrupt normal operation
  }
}
