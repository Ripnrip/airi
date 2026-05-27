import type { MetadataEventSource } from '@proj-airi/server-sdk'

interface EventSourcePayload {
  source?: string
  metadata?: { source?: MetadataEventSource }
}

/**
 * Returns a human-readable source label for legacy plugin and extension identities.
 *
 * Use when:
 * - UI stores need to display or compare websocket event sources
 * - Protocol metadata may come from legacy module peers or extension/module peers
 *
 * Expects:
 * - `source` is a protocol metadata identity from server-shared/server-sdk
 *
 * Returns:
 * - A stable label, preferring legacy plugin ids and extension-scoped module ids
 */
export function getMetadataSourceLabel(source?: MetadataEventSource) {
  if (!source)
    return undefined

  if ('plugin' in source) {
    return source.plugin.id
  }

  if ('extension' in source) {
    return `${source.extension.id}:${source.id}`
  }

  return source.id
}

function formatMetadataSource(source?: MetadataEventSource) {
  if (!source)
    return undefined

  if ('plugin' in source) {
    const pluginId = source.plugin.id
    const instanceId = source.id
    return instanceId ? `${pluginId}:${instanceId}` : pluginId
  }

  return getMetadataSourceLabel(source)
}

export function getEventSourceKey(event: EventSourcePayload, fallback = 'unknown') {
  return (
    formatMetadataSource(event.metadata?.source)
    ?? event.source
    ?? fallback
  )
}
