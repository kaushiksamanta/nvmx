import { Type, Static } from '@sinclair/typebox'

// Node.js release
export const NodeReleaseSchema = Type.Object({
  version: Type.String({ pattern: '^v\\d+\\.\\d+\\.\\d+$' }),
  date: Type.String({ format: 'date' }),
  files: Type.Array(Type.String()),
  npm: Type.Optional(Type.String()),
  v8: Type.Optional(Type.String()),
  lts: Type.Optional(Type.Union([Type.String(), Type.Boolean()])),
  security: Type.Optional(Type.Boolean()),
})

export type NodeRelease = Static<typeof NodeReleaseSchema>

// Installed versions response
export const InstalledVersionsSchema = Type.Array(
  Type.String({
    pattern: '^v\\d+\\.\\d+\\.\\d+$',
    description: 'Node.js version string (e.g., v14.17.0)',
  }),
)

export type InstalledVersions = Static<typeof InstalledVersionsSchema>

// Remote versions response
export const RemoteVersionsSchema = Type.Array(
  Type.String({
    pattern: '^v\\d+\\.\\d+\\.\\d+$',
    description: 'Node.js version string (e.g., v14.17.0)',
  }),
)

export type RemoteVersions = Static<typeof RemoteVersionsSchema>

// Installation result
export const InstallResultSchema = Type.Object({
  success: Type.Boolean(),
  version: Type.String({ pattern: '^v\\d+\\.\\d+\\.\\d+$' }),
  message: Type.String(),
})

export type InstallResult = Static<typeof InstallResultSchema>

// Use version result
export const UseVersionResultSchema = Type.Object({
  success: Type.Boolean(),
  version: Type.String({ pattern: '^v\\d+\\.\\d+\\.\\d+$' }),
  message: Type.String(),
})

export type UseVersionResult = Static<typeof UseVersionResultSchema>

// Uninstall result
export const UninstallResultSchema = Type.Object({
  success: Type.Boolean(),
  version: Type.String({ pattern: '^v\\d+\\.\\d+\\.\\d+$' }),
  message: Type.String(),
})

export type UninstallResult = Static<typeof UninstallResultSchema>
