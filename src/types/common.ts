import { Type, Static } from '@sinclair/typebox'

// Version string (e.g., v14.17.0)
export const VersionSchema = Type.String({
  pattern: '^v?\\d+\\.\\d+\\.\\d+$',
  description: 'Node.js version string (e.g., v14.17.0)',
})

export type Version = Static<typeof VersionSchema>

// CPU architecture
export const ArchSchema = Type.Union([Type.Literal('x64'), Type.Literal('arm64')], {
  description: 'CPU architecture',
})

export type Arch = Static<typeof ArchSchema>

// Operating system platform
export const PlatformSchema = Type.Union([Type.Literal('darwin'), Type.Literal('linux')], {
  description: 'Operating system platform',
})

export type Platform = Static<typeof PlatformSchema>

// File system path
export const PathSchema = Type.String({
  description: 'File system path',
})

export type Path = Static<typeof PathSchema>

// URL string
export const UrlSchema = Type.String({
  format: 'uri',
  description: 'URL string',
})

export type Url = Static<typeof UrlSchema>

// Version file types
export const VersionFileSchema = Type.Union(
  [Type.Literal('.nvmxrc'), Type.Literal('.node-version')],
  { description: 'Node.js version file name' },
)

export type VersionFile = Static<typeof VersionFileSchema>
