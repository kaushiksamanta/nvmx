import { Type, Static } from '@sinclair/typebox'

// Cache configuration
export const CacheConfigSchema = Type.Object({
  maxSize: Type.Number({ description: 'Maximum cache size in MB' }),
  ttl: Type.Number({ description: 'Cache time-to-live in days' }),
})

// Remote versions cache configuration
export const RemoteVersionsCacheSchema = Type.Object({
  versions: Type.Array(Type.String()),
  timestamp: Type.Number({ description: 'Cache timestamp in milliseconds' }),
  ttl: Type.Number({ description: 'Cache time-to-live in minutes' }),
})

export type CacheConfig = Static<typeof CacheConfigSchema>

// Aliases configuration
export const AliasesSchema = Type.Record(
  Type.String({ description: 'Alias name' }),
  Type.String({ description: 'Node.js version' }),
  { description: 'Map of aliases to Node.js versions' },
)

export type Aliases = Static<typeof AliasesSchema>

// NVMX configuration
export const NvmxConfigSchema = Type.Object({
  mirrorUrl: Type.String({ format: 'uri', description: 'URL for Node.js distribution mirror' }),
  defaultVersion: Type.Optional(Type.String({ description: 'Default Node.js version to use' })),
  proxyUrl: Type.Optional(Type.String({ format: 'uri', description: 'Proxy URL for downloads' })),
  cache: CacheConfigSchema,
  aliases: Type.Optional(AliasesSchema),
  remoteVersionsCache: Type.Optional(RemoteVersionsCacheSchema),
})

export type NvmxConfig = Static<typeof NvmxConfigSchema>
