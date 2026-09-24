import { useEffect, useMemo, useState } from 'react'
import { initialResponses, slots } from './seed'
import { load, save, subscribe } from './storage'
import type { Filter, Response, Role } from './types'

const isOrganizer = location.pathname.includes('/edit/') && location.pathname.endsWith('eon-admin')
const effectiveRole = (r: Response) => r.organizerRole ?? r.role
const timeLabel = (slot: string) => { const [h, m] = slot.split(':').map(Number); return `${h === 12 ? 12 : h % 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}` }

function RolePill({ role }: { role: Role }) { return <span className={`role ${role ?? 'none'}`}>{role ? role.toUpperCase() : 'UNASSIGNED'}</span> }

export default function App() {
  const [responses, setResponses] = useState<Response[]>(load)
  const [filter, setFilter] = useState<Filter>('both')
  const [open, setOpen] = useState(false)
  const [notice, setNotice] = useState('')
  useEffect(() => { if (!localStorage.getItem('eon-day-responses-v1')) save(initialResponses); return subscribe(setResponses) }, [])
  const visible = useMemo(() => responses.filter(r => filter === 'both' || effectiveRole(r) === filter), [responses, filter])
  const counts = useMemo(() => Object.fromEntries(slots.map(s => [s, visible.filter(r => r.slots.includes(s)).length])), [visible]) as Record<string, number>
  const update = (next: Response[]) => { setResponses(next); save(next) }
  const tag = (id: string, role: Role) => update(responses.map(r => r.id === id ? { ...r, organizerRole: role } : r))
  const addResponse = (response: Response) => { update([...responses, response]); setOpen(false); setNotice('Your availability is now shared with the group.') }
  return <main>
    <header><a className="brand" href="/l/J6Avq"><span>●</span> meet</a><div className="header-note">EoN Day availability poll</div></header>
    <section className="card intro">
      <div><p className="eyebrow">GROUP MEETING</p><h1>EoN Day</h1><p className="muted">Tuesday, September 29, 2026 · Toronto time</p></div>
      <button className="primary" onClick={() => setOpen(true)}>+ Add availability</button>
    </section>
    {isOrganizer && <div className="organizer-banner">Organizer mode is on. Choose a role beside any response to override its self-selected tag.</div>}
    <section className="toolbar card"><div><p className="small-label">VIEW AVAILABILITY FOR</p><div className="filters">{(['both', 'exec', 'jit'] as Filter[]).map(f => <button key={f} onClick={() => setFilter(f)} className={filter === f ? `filter selected ${f}` : 'filter'}>{f === 'both' ? 'Both' : f.toUpperCase()}</button>)}</div></div><p className="responders"><strong>{visible.length}</strong> responses shown</p></section>
    {notice && <div className="notice">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    <section className="schedule card"><div className="datebar"><span>SEP</span><strong>29</strong><span>TUE</span></div><div className="grid-wrap"><div className="grid"><div className="grid-head empty" />{slots.map((slot, i) => <div className="grid-head" key={slot}>{i % 2 === 0 && timeLabel(slot)}</div>)}<div className="summary-label">GROUP<br/>AVAILABILITY</div>{slots.map(slot => <div className="summary" key={slot} style={{ '--fill': visible.length ? counts[slot] / visible.length : 0 } as React.CSSProperties}><span>{counts[slot] || ''}</span></div>)}{visible.map(response => <ResponseRow key={response.id} response={response} onTag={tag} />)}</div></div><p className="legend"><i /> Darker green means more people are available. Select a role to recalculate this view.</p></section>
    <p className="footnote">Times shown in America/Toronto · Updates are saved in this browser and shared with other open tabs.</p>
    {open && <ResponseForm onClose={() => setOpen(false)} onSave={addResponse} />}
  </main>
}

function ResponseRow({ response, onTag }: { response: Response; onTag: (id: string, role: Role) => void }) {
  return <><div className="person"><div className="person-name" title={response.name}>{response.name}</div><RolePill role={effectiveRole(response)} />{isOrganizer && <select aria-label={`Set role for ${response.name}`} value={effectiveRole(response) ?? ''} onChange={e => onTag(response.id, (e.target.value || null) as Role)}><option value="">—</option><option value="exec">Exec</option><option value="jit">JIT</option></select>}</div>{slots.map(slot => <div key={slot} className={response.slots.includes(slot) ? 'available' : 'unavailable'} />)}</>
}

function ResponseForm({ onClose, onSave }: { onClose: () => void; onSave: (r: Response) => void }) {
  const [name, setName] = useState(''); const [role, setRole] = useState<Role>(null); const [chosen, setChosen] = useState<string[]>([])
  const toggle = (slot: string) => setChosen(old => old.includes(slot) ? old.filter(x => x !== slot) : [...old, slot])
  const valid = name.trim() && role && chosen.length
  return <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={e => { e.preventDefault(); if (valid) onSave({ id: crypto.randomUUID(), name: name.trim(), role, slots: chosen, token: crypto.randomUUID() }) }}><button className="close" type="button" onClick={onClose}>×</button><p className="eyebrow">YOUR RESPONSE</p><h2>When can you meet?</h2><label>Your name<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name" /></label><fieldset><legend>Your group</legend><button type="button" className={role === 'exec' ? 'choice exec chosen' : 'choice exec'} onClick={() => setRole('exec')}>EXEC</button><button type="button" className={role === 'jit' ? 'choice jit chosen' : 'choice jit'} onClick={() => setRole('jit')}>JIT</button></fieldset><label>Available times <span className="hint">{chosen.length} selected</span></label><div className="slot-picker">{slots.map(slot => <button type="button" key={slot} onClick={() => toggle(slot)} className={chosen.includes(slot) ? 'picked' : ''}>{timeLabel(slot)}</button>)}</div><button className="primary submit" disabled={!valid}>Share availability</button></form></div>
}
