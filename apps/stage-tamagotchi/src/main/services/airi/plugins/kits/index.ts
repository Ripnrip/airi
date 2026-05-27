import type { ExtensionHost } from '@proj-airi/plugin-sdk/plugin-host'

import type { SetupExtensionHostOptions } from '../types'

import {
  createGameletHostContribution,
  registerGameletPluginKit,
} from './gamelet'
import { registerWidgetPluginKit } from './widget'

/**
 * Creates the built-in kit runtime installed by the Electron extension host.
 *
 * Use when:
 * - Host bootstrap should depend on a kit-layer API instead of wiring widget/gamelet details inline
 * - Built-in kit registration and contributions should remain outside the host layer
 *
 * Expects:
 * - `widgetsManager` is initialized before host construction
 *
 * Returns:
 * - Helpers to attach contributions and register built-in kits on the host
 */
export function createBuiltInExtensionKitRuntime(options: SetupExtensionHostOptions): {
  contributions: ReturnType<typeof createGameletHostContribution>['contribution'][]
  attachHost: (host: ExtensionHost) => void
  registerHostKits: (host: ExtensionHost) => void
} {
  const gameletContribution = createGameletHostContribution({
    widgetsManager: options.widgetsManager,
  })

  return {
    contributions: [gameletContribution.contribution],
    attachHost(host) {
      gameletContribution.attachHost(host)
    },
    registerHostKits(host) {
      registerWidgetPluginKit(host)
      registerGameletPluginKit(host)
    },
  }
}
