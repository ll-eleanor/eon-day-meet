import type { Response } from './types'

export const slots = Array.from({ length: 18 }, (_, i) => `${String(14 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 ? '30' : '00'}`)
const range = (start: number, end: number) => slots.slice(start, end)
export const initialResponses: Response[] = [
  { id: '1', name: 'max, eleanor, steven probably', role: null, slots: range(0, 18) },
  { id: '2', name: 'sam', role: null, slots: [...range(0, 9), ...range(15, 18)] },
  { id: '3', name: 'cindy', role: null, slots: [...range(0, 3), ...range(7, 18)] },
  { id: '4', name: 'kathleen', role: null, slots: [...range(0, 3), ...range(7, 18)] },
  { id: '5', name: 'aaron', role: null, slots: [...range(0, 3), ...range(7, 18)] },
  { id: '6', name: 'jennifer', role: null, slots: range(6, 18) },
  { id: '7', name: 'Ivy', role: null, slots: [...range(0, 7), ...range(11, 18)] },
  { id: '8', name: 'Kayshini', role: null, slots: [...range(4, 6), ...range(10, 18)] },
  { id: '9', name: 'Conor, Mattias, Dane, Aubrey, Tammy, Faaz, Megan, Matthew, Avery, Cedric, William, Ishan, Nathan, Zenith, Victoria, Sherlyn, Victor', role: null, slots: range(4, 18) },
  { id: '10', name: 'Ethan', role: null, slots: [] },
  { id: '11', name: 'Manya', role: null, slots: [...range(4, 8), ...range(11, 18)] },
  { id: '12', name: 'Anna', role: null, slots: range(5, 18) },
  { id: '13', name: 'Bella', role: null, slots: [...range(5, 9), ...range(15, 18)] },
  { id: '14', name: 'Caitlyn, Pallas', role: null, slots: [...range(4, 9), ...range(15, 18)] }
]
