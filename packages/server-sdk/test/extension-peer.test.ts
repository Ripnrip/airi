import type { WebSocketEventOptionalSource } from '@proj-airi/server-shared/types'

import { describe, expect, it, vi } from 'vitest'

import { createWebSocketExtensionPeer } from '../src/extension-peer'

class FakeClient {
  readonly sent: WebSocketEventOptionalSource[] = []
  readonly connect = vi.fn(async () => {})
  readonly close = vi.fn(() => {})

  send(data: WebSocketEventOptionalSource): boolean {
    this.sent.push(data)
    return true
  }

  sendOrThrow(data: WebSocketEventOptionalSource): void {
    this.sent.push(data)
  }
}

describe('websocket extension peer', () => {
  /**
   * @example
   * expect(fakeClient.sent.map(event => event.type)).toEqual(['peer:authenticate', 'extension:announce'])
   */
  it('authenticates the websocket peer separately from the extension session', async () => {
    const fakeClient = new FakeClient()
    const peer = createWebSocketExtensionPeer({
      extension: {
        id: 'airi-extension-chess',
        version: '1.0.0',
        sessionId: 'session-1',
      },
      client: fakeClient,
    })

    await peer.connect()
    peer.authenticatePeer({ token: 'secret', peerId: 'peer-1' })
    peer.announceExtension()

    expect(fakeClient.connect).toHaveBeenCalled()
    expect(fakeClient.sent.map(event => event.type)).toEqual([
      'peer:authenticate',
      'extension:announce',
    ])
    expect(fakeClient.sent[0]).toMatchObject({
      type: 'peer:authenticate',
      data: {
        token: 'secret',
        peerId: 'peer-1',
      },
    })
    expect(fakeClient.sent[1]).toMatchObject({
      type: 'extension:announce',
      data: {
        identity: {
          id: 'airi-extension-chess',
          version: '1.0.0',
          sessionId: 'session-1',
        },
      },
    })
  })

  /**
   * @example
   * expect(fakeClient.sent[0].type).toBe('extension:module:announce')
   */
  it('announces extension modules under the owning extension identity', () => {
    const fakeClient = new FakeClient()
    const peer = createWebSocketExtensionPeer({
      extension: {
        id: 'airi-extension-chess',
        sessionId: 'session-1',
      },
      client: fakeClient,
    })

    peer.announceModule({
      id: 'chess-gamelet',
      name: 'Chess Gamelet',
      possibleEvents: [],
    })

    expect(fakeClient.sent[0]).toMatchObject({
      type: 'extension:module:announce',
      data: {
        name: 'Chess Gamelet',
        identity: {
          id: 'chess-gamelet',
          extension: {
            id: 'airi-extension-chess',
            sessionId: 'session-1',
          },
        },
        possibleEvents: [],
      },
    })
  })
})
