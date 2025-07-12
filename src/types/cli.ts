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
  ],
  { description: 'NVMX command' },
)

export type NvmxCommand = Static<typeof NvmxCommandSchema>

// Configuration keys
export const ConfigKeySchema = Type.Union(
  [Type.Literal('mirror'), Type.Literal('proxy'), Type.Literal('default')],
  { description: 'Configuration key' },
)

export type ConfigKey = Static<typeof ConfigKeySchema>
