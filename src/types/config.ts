import { Type, Static } from '@sinclair/typebox'

// Cache configuration
export const CacheConfigSchema = Type.Object({
  maxSize: Type.Number({ description: 'Maximum cache size in MB' }),
  ttl: Type.Number({ description: 'Cache time-to-live in days' }),
})

export type CacheConfig = Static<typeof CacheConfigSchema>

// NVMX configuration
export const NvmxConfigSchema = Type.Object({
  mirrorUrl: Type.String({ format: 'uri', description: 'URL for Node.js distribution mirror' }),
  defaultVersion: Type.Optional(Type.String({ description: 'Default Node.js version to use' })),
  proxyUrl: Type.Optional(Type.String({ format: 'uri', description: 'Proxy URL for downloads' })),
  cache: CacheConfigSchema,
})

export type NvmxConfig = Static<typeof NvmxConfigSchema>
