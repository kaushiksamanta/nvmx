import { describe, it, expect } from 'vitest'
import {
  generateBashCompletion,
  generateZshCompletion,
  generateFishCompletion,
} from '../src/completions'

describe('completions', () => {
  describe('generateBashCompletion', () => {
    it('should generate a valid Bash completion script', () => {
      const result = generateBashCompletion()

      expect(typeof result).toBe('string')

      // Check that it contains key Bash completion elements
      expect(result).toContain('_nvmx_completions')
      expect(result).toContain('COMPREPLY')
      expect(result).toContain('complete -F _nvmx_completions nvmx')

      // Check that it handles all main commands
      expect(result).toContain(
        'install use list ls ls-remote current uninstall remove config shell alias cache',
      )

      // Check that it handles subcommands
      expect(result).toContain('alias')
      expect(result).toContain('config')
      expect(result).toContain('cache')
    })
  })

  describe('generateZshCompletion', () => {
    it('should generate a valid Zsh completion script', () => {
      const result = generateZshCompletion()

      // Check that the result is a string
      expect(typeof result).toBe('string')

      // Check that it contains key Zsh completion elements
      expect(result).toContain('#compdef nvmx')
      expect(result).toContain('_nvmx')
      expect(result).toContain('_arguments')

      // Check that it handles all main commands
      expect(result).toContain('install:Install a specific Node.js version')
      expect(result).toContain('use:Use a specific Node.js version')
      expect(result).toContain('list:List installed Node.js versions')
      expect(result).toContain('alias:Manage Node.js version aliases')
      expect(result).toContain('cache:Manage nvmx cache')

      // Check that it handles subcommands
      expect(result).toContain('alias subcommands')
      expect(result).toContain('config subcommands')
      expect(result).toContain('cache subcommands')
    })
  })

  describe('generateFishCompletion', () => {
    it('should generate a valid Fish completion script', () => {
      const result = generateFishCompletion()

      // Check that the result is a string
      expect(typeof result).toBe('string')

      // Check that it contains key Fish completion elements
      expect(result).toContain('# nvmx fish completion')
      expect(result).toContain('function __nvmx_needs_command')
      expect(result).toContain('complete -f -c nvmx')

      // Check that it handles all main commands
      expect(result).toContain('install -d')
      expect(result).toContain('use -d')
      expect(result).toContain('list -d')
      expect(result).toContain('alias -d')
      expect(result).toContain('cache -d')

      // Check that it handles subcommands
      expect(result).toContain('alias list')
      expect(result).toContain('config get')
      expect(result).toContain("'__nvmx_using_command cache' -a set-ttl")
    })
  })
})
