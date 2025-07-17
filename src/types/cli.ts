import { Type, Static } from '@sinclair/typebox'

// CLI commands
export const NvmxCommandSchema = Type.Union(
  [
    Type.Literal('install'),
    Type.Literal('use'),
    Type.Literal('list'),
    Type.Literal('ls'),
    Type.Literal('ls-remote'),
    Type.Literal('current'),
    Type.Literal('uninstall'),
    Type.Literal('remove'),
    Type.Literal('config'),
    Type.Literal('shell'),
    Type.Literal('alias'),
    Type.Literal('cache'),
    Type.Literal('completion'),
    Type.Literal('update'),
    Type.Literal('check-update'),
  ],
  { description: 'NVMX command' },
)

// Alias commands
export const AliasCommandSchema = Type.Union(
  [
    Type.Literal('list'),
    Type.Literal('ls'),
    Type.Literal('set'),
    Type.Literal('rm'),
    Type.Literal('remove'),
  ],
  { description: 'Alias command' },
)

export type AliasCommand = Static<typeof AliasCommandSchema>

export type NvmxCommand = Static<typeof NvmxCommandSchema>

// Configuration keys
export const ConfigKeySchema = Type.Union(
  [Type.Literal('mirror'), Type.Literal('proxy'), Type.Literal('default')],
  { description: 'Configuration key' },
)

export type ConfigKey = Static<typeof ConfigKeySchema>

// Cache commands
export const CacheCommandSchema = Type.Union(
  [Type.Literal('set-ttl'), Type.Literal('clear-remote')],
  { description: 'Cache command' },
)

export type CacheCommand = Static<typeof CacheCommandSchema>

// Completion commands
export const CompletionCommandSchema = Type.Union(
  [Type.Literal('bash'), Type.Literal('zsh'), Type.Literal('fish')],
  { description: 'Completion command' },
)

export type CompletionCommand = Static<typeof CompletionCommandSchema>
