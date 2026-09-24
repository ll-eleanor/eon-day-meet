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
  const [activeSlot, setActiveSlot] = useState<string | null>(null)
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
    <section className="schedule card"><OverlapCalendar visible={visible} counts={counts} activeSlot={activeSlot} setActiveSlot={setActiveSlot} /><p className="legend"><i /> Darker green means more people are available. Hover or tap a time to see who can make it.</p></section>
    {isOrganizer && <OrganizerTags responses={responses} onTag={tag} />}
    <p className="footnote">Times shown in America/Toronto · Updates are saved in this browser and shared with other open tabs.</p>
    {open && <ResponseForm onClose={() => setOpen(false)} onSave={addResponse} />}
  </main>
}

function OverlapCalendar({ visible, counts, activeSlot, setActiveSlot }: { visible: Response[]; counts: Record<string, number>; activeSlot: string | null; setActiveSlot: (slot: string | null) => void }) {
  const activeResponses = activeSlot ? visible.filter(r => r.slots.includes(activeSlot)) : []
  const unavailable = activeSlot ? visible.filter(r => !r.slots.includes(activeSlot)) : []
  const describe = (slot: string) => `${timeLabel(slot)} on Tuesday, September 29: ${counts[slot] || 0} of ${visible.length} responses available`
  return <div className="calendar-shell" onMouseLeave={() => setActiveSlot(null)}>
    <div className="calendar-heading"><div /><div><span>SEP</span><strong>29</strong><span>TUE</span></div></div>
    <div className="overlap-calendar">
      {slots.map(slot => <div className="calendar-row" key={slot}>
        <div className="time-axis">{timeLabel(slot)}</div>
        <button type="button" aria-label={describe(slot)} aria-expanded={activeSlot === slot} className={`overlap-cell ${activeSlot === slot ? 'selected' : ''}`} style={{ '--fill': visible.length ? counts[slot] / visible.length : 0 } as React.CSSProperties} onMouseEnter={() => setActiveSlot(slot)} onFocus={() => setActiveSlot(slot)} onClick={() => setActiveSlot(activeSlot === slot ? null : slot)} onKeyDown={event => { if (event.key === 'Escape') { event.currentTarget.blur(); setActiveSlot(null) } }}>
          <span>{counts[slot] || '—'}</span><small>{visible.length ? `of ${visible.length}` : 'no responses'}</small>
        </button>
      </div>)}
    </div>
    {activeSlot && <div className="availability-popover" role="status"><div className="popover-heading"><div><strong>Tue, Sep 29</strong><span>{timeLabel(activeSlot)}–{timeLabel(slots[Math.min(slots.indexOf(activeSlot) + 1, slots.length - 1)])}</span></div><b>{counts[activeSlot]} / {visible.length}</b></div><AvailabilityList title="Available" responses={activeResponses} empty="No one is available." /><AvailabilityList title="Unavailable" responses={unavailable} empty="Everyone is available." /></div>}
  </div>
}

function AvailabilityList({ title, responses, empty }: { title: string; responses: Response[]; empty: string }) {
  return <div className="availability-list"><h3>{title} <span>{responses.length}</span></h3>{responses.length ? responses.map(response => <div className="availability-person" key={response.id}><span title={response.name}>{response.name}</span><RolePill role={effectiveRole(response)} /></div>) : <p>{empty}</p>}</div>
}

function OrganizerTags({ responses, onTag }: { responses: Response[]; onTag: (id: string, role: Role) => void }) {
  return <section className="organizer-list card"><p className="small-label">ORGANIZER ROLE OVERRIDES</p>{responses.map(response => <div className="organizer-person" key={response.id}><span title={response.name}>{response.name}</span><RolePill role={effectiveRole(response)} /><select aria-label={`Set role for ${response.name}`} value={effectiveRole(response) ?? ''} onChange={e => onTag(response.id, (e.target.value || null) as Role)}><option value="">Unassigned</option><option value="exec">Exec</option><option value="jit">JIT</option></select></div>)}</section>
}

function ResponseForm({ onClose, onSave }: { onClose: () => void; onSave: (r: Response) => void }) {
  const [name, setName] = useState(''); const [role, setRole] = useState<Role>(null); const [chosen, setChosen] = useState<string[]>([])
  const toggle = (slot: string) => setChosen(old => old.includes(slot) ? old.filter(x => x !== slot) : [...old, slot])
  const valid = name.trim() && role && chosen.length
  return <div className="modal-backdrop" role="presentation"><form className="modal" onSubmit={e => { e.preventDefault(); if (valid) onSave({ id: crypto.randomUUID(), name: name.trim(), role, slots: chosen, token: crypto.randomUUID() }) }}><button className="close" type="button" onClick={onClose}>×</button><p className="eyebrow">YOUR RESPONSE</p><h2>When can you meet?</h2><label>Your name<input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Name" /></label><fieldset><legend>Your group</legend><button type="button" className={role === 'exec' ? 'choice exec chosen' : 'choice exec'} onClick={() => setRole('exec')}>EXEC</button><button type="button" className={role === 'jit' ? 'choice jit chosen' : 'choice jit'} onClick={() => setRole('jit')}>JIT</button></fieldset><label>Available times <span className="hint">{chosen.length} selected</span></label><div className="slot-picker">{slots.map(slot => <button type="button" key={slot} onClick={() => toggle(slot)} className={chosen.includes(slot) ? 'picked' : ''}>{timeLabel(slot)}</button>)}</div><button className="primary submit" disabled={!valid}>Share availability</button></form></div>
}
