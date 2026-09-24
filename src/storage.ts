import { initialResponses } from './seed'
import type { Response } from './types'

const KEY = 'eon-day-responses-v1'
const channel = new BroadcastChannel('eon-day-poll')
export const load = (): Response[] => {
  try { return JSON.parse(localStorage.getItem(KEY) || '') } catch { return initialResponses }
}
export const save = (responses: Response[]) => { localStorage.setItem(KEY, JSON.stringify(responses)); channel.postMessage(responses) }
export const subscribe = (fn: (responses: Response[]) => void) => { channel.onmessage = (event) => fn(event.data as Response[]); return () => { channel.onmessage = null } }
