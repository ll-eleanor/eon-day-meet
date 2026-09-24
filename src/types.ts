export type Role = 'exec' | 'jit' | null
export type Filter = 'both' | 'exec' | 'jit'
export type Response = { id: string; name: string; role: Role; organizerRole?: Role; slots: string[]; token?: string }
