import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore.js'
import { useUI } from '../store/useUI.js'
import { t } from '../lib/i18n.js'
import { fmtDate, exCount } from '../lib/format.js'
import { parsePlan } from '../lib/plan-share.js'
import { DEMO } from '../lib/demo.js'
import { canTrain, listStudents, getStudent, sendPlan, planForStudent, fetchInbox, clearInbox } from '../lib/trainer.js'
import { planImportSheet } from '../sheets.jsx'
import Icon from '../components/Icon.jsx'
import { Button, Section, Row, Switch, TextArea, SearchField } from '../components/ui.jsx'

// Center Gym: área do professor. Ele monta as fichas na própria conta (Plano) e envia as que
// escolher a um aluno. Não edita a conta do aluno: o aluno recebe e adiciona.

// Textos desta tela em português, aqui mesmo: os pacotes de idioma (locales/) têm de ter as
// mesmas chaves nos 17 idiomas, e esta área é da versão brasileira. O que já existe nos pacotes
// (Cancelar, Fichas…) continua vindo de lá.
const PT = {
  "A plan you sent is waiting for the student to accept it.": "Um treino que você enviou aguarda o aluno aceitar.",
  "Build routines in your own Plan tab, then send them to a student. You see their routines and recent workouts, never their body weight.": "Monte as fichas na sua aba Plano e envie para um aluno. Você vê as fichas e os treinos recentes dele, nunca o peso corporal.",
  "Build the routines in your own Plan tab first — what you send is a copy of them.": "Monte primeiro as fichas na sua aba Plano — o aluno recebe uma cópia delas.",
  "Choose which of your routines to send. The student gets a copy and nothing they already have is changed.": "Escolha quais das suas fichas enviar. O aluno recebe uma cópia e nada do que ele já tem é alterado.",
  "Last workout {0}": "Último treino em {0}",
  "New plan from {0}": "Novo treino de {0}",
  "No student matches": "Nenhum aluno encontrado",
  "No students yet": "Ainda não há alunos",
  "No workouts yet": "Ainda sem treinos",
  "Note for the student (optional)": "Recado para o aluno (opcional)",
  "OK": "OK",
  "Plan from your trainer": "Treino do seu professor",
  "Plan from {0}": "Treino de {0}",
  "Plan sent to {0}": "Treino enviado para {0}",
  "Plan sent — waiting for the student": "Treino enviado — aguardando o aluno",
  "Search students": "Buscar aluno",
  "See and add": "Ver e adicionar",
  "Send a plan": "Enviar um treino",
  "Send a plan to {0}": "Enviar treino para {0}",
  "Send plan": "Enviar treino",
  "Send the weekdays too": "Enviar também os dias da semana",
  "Students": "Alunos",
  "The student can adopt your week or keep their own.": "O aluno pode adotar a sua semana ou manter a dele.",
  "{0} student": "{0} aluno",
  "{0} students": "{0} alunos",
}
const tr = (k, ...a) => PT[k] ? PT[k].replace(/\{(\d)\}/g, (_, i) => a[i]) : t(k, ...a)

const lastLine = s => s.lastWorkout ? tr('Last workout {0}', fmtDate(s.lastWorkout)) : tr('No workouts yet')

function SendSheet({ student, close, onSent }) {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const toast = useUI(s => s.toast)
  const routines = (S.routines || []).filter(r => r.ex && r.ex.length)
  const [picked, setPicked] = useState(() => routines.map(r => r.id))
  const [week, setWeek] = useState(true)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const toggle = id => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const send = async () => {
    setBusy(true)
    try {
      await sendPlan(student.id, planForStudent(S, picked, { week, name: user?.name ? tr('Plan from {0}', user.name) : tr('Plan from your trainer') }), note.trim())
      close(); toast(tr('Plan sent to {0}', student.name)); onSent?.()
    } catch (e) { toast(e.message); setBusy(false) }
  }
  if (!routines.length) return <>
    <h3>{tr('Send a plan to {0}', student.name)}</h3>
    <div className="muted small" style={{ marginBottom: 16, lineHeight: 1.4 }}>{tr('Build the routines in your own Plan tab first — what you send is a copy of them.')}</div>
    <Button variant="primary" onClick={close}>{tr('OK')}</Button>
  </>
  return <>
    <h3>{tr('Send a plan to {0}', student.name)}</h3>
    <div className="muted small" style={{ marginBottom: 12, lineHeight: 1.4 }}>{tr('Choose which of your routines to send. The student gets a copy and nothing they already have is changed.')}</div>
    <div className="sect-b" style={{ marginBottom: 14 }}>
      {routines.map(r => <Row key={r.id} title={r.name} subtitle={exCount(r.ex.length)} onClick={() => toggle(r.id)}
        accessory={picked.includes(r.id) ? 'check' : 'none'} />)}
    </div>
    <div className="row between" style={{ padding: '10px 2px', gap: 12, marginBottom: 12 }}>
      <div><div className="tt" style={{ fontSize: 15 }}>{tr('Send the weekdays too')}</div><div className="small dim">{tr('The student can adopt your week or keep their own.')}</div></div>
      <Switch checked={week} onChange={setWeek} />
    </div>
    <TextArea placeholder={tr('Note for the student (optional)')} maxLength={500} rows={2} value={note} onChange={e => setNote(e.target.value)} />
    <div style={{ height: 14 }} />
    <Button variant="primary" icon="upload" onClick={send} disabled={busy || !picked.length}>{tr('Send plan')}</Button>
    <div style={{ height: 8 }} />
    <Button variant="ghost" className="dim" onClick={close}>{tr('Cancel')}</Button>
  </>
}

function StudentSheet({ id, close, onSent }) {
  const S = useStore(s => s.S)
  const toast = useUI(s => s.toast)
  const openSheet = useUI(s => s.openSheet)
  const [d, setD] = useState(null)
  useEffect(() => { getStudent(S, id).then(setD).catch(e => { toast(e.message); close() }) }, [id])
  if (!d) return <div className="muted small">{tr('Loading…')}</div>
  return <>
    <h3 className="capitalize">{d.student.name}</h3>
    {d.pending && <div className="small" style={{ color: 'var(--orange)', marginBottom: 10 }}>{tr('A plan you sent is waiting for the student to accept it.')}</div>}
    <h4 className="sec">{tr('Routines')}</h4>
    {d.routines.length
      ? <div className="sect-b">{d.routines.map(r => <Row key={r.id} title={r.name} value={exCount(r.count)} />)}</div>
      : <div className="dim small">{tr('No routines yet.')}</div>}
    <h4 className="sec">{tr('Recent workouts')}</h4>
    {d.workouts.length
      ? <div className="sect-b">{d.workouts.map(w => <Row key={w.id} title={w.name || tr('Workout')} value={fmtDate(w.d)} />)}</div>
      : <div className="dim small">{tr('No workouts yet')}</div>}
    <div style={{ height: 16 }} />
    <Button variant="primary" icon="upload" onClick={() => { close(); openSheet(c => <SendSheet student={d.student} close={c} onSent={onSent} />) }}>{tr('Send a plan')}</Button>
  </>
}

export default function Trainer() {
  const nav = useNavigate()
  const S = useStore(s => s.S)
  const openSheet = useUI(s => s.openSheet)
  const [students, setStudents] = useState(null)
  const [err, setErr] = useState('')
  const [q, setQ] = useState('')
  const load = () => listStudents(S).then(l => { setStudents(l); setErr('') }).catch(e => setErr(e.message))
  useEffect(() => { load() }, [])
  const shown = (students || []).filter(s => s.name.toLowerCase().includes(q.trim().toLowerCase()))
  return <div className="narrow">
    <div className="hdr">
      <button className="iconbtn" onClick={() => nav('/settings')} aria-label={tr('Back')}><Icon name="chevronLeft" /></button>
      <div style={{ flex: 1, marginInlineStart: 8 }}><h1 style={{ margin: 0 }}>{tr('Students')}</h1>
        <div className="sub">{students ? tr(students.length === 1 ? '{0} student' : '{0} students', students.length) : err ? tr('Could not load') : tr('Loading…')}</div></div>
    </div>
    {DEMO && <div className="card small muted" style={{ marginBottom: 14, lineHeight: 1.45 }}>
      Demonstração: os alunos abaixo são fictícios. Envie um treino para <b>Você (este aparelho)</b> e volte ao Início para ver como o aluno recebe.
    </div>}
    {err && <div className="card small" role="alert" style={{ borderColor: 'var(--red)', marginBottom: 14 }}>{err} <Button size="sm" icon="reset" onClick={load}>{tr('Try again')}</Button></div>}
    {students && students.length > 8 && <><SearchField value={q} onChange={e => setQ(e.target.value)} onClear={() => setQ('')} placeholder={tr('Search students')} /><div style={{ height: 12 }} /></>}
    <Section footer={tr('Build routines in your own Plan tab, then send them to a student. You see their routines and recent workouts, never their body weight.')}>
      {shown.map(s => <Row key={s.id} icon="person" iconTint={s.pending ? 'var(--orange)' : 'var(--blue)'} title={s.name}
        subtitle={s.pending ? tr('Plan sent — waiting for the student') : lastLine(s)} value={s.workouts} accessory="chevron"
        onClick={() => openSheet(close => <StudentSheet id={s.id} close={close} onSent={load} />)} />)}
      {students && !shown.length && <Row title={q ? tr('No student matches') : tr('No students yet')} />}
    </Section>
  </div>
}

/** Início do aluno: o treino que o professor enviou, até ser adicionado ou dispensado. */
export function PlanInboxCard() {
  const S = useStore(s => s.S)
  const user = useStore(s => s.user)
  const toast = useUI(s => s.toast)
  const [p, setP] = useState(null)
  useEffect(() => { fetchInbox(user).then(setP).catch(() => {}) }, [user?.id])
  if (!p) return null
  const done = () => { clearInbox(p.ts).catch(() => {}); setP(null) }
  const open = () => {
    try { planImportSheet({ ...parsePlan(p.plan, S.unit || 'kg'), name: p.plan.name }, { schedule: true, onDone: done }) }
    catch (e) { toast(tr('Import failed: {0}', e.message)) }
  }
  return <div className="card" style={{ borderColor: 'var(--acc)' }}>
    <div className="row" style={{ gap: 9, marginBottom: 8 }}>
      <span className="lrow-i" style={{ background: 'var(--acc)' }}><Icon name="sparkles" /></span>
      <div style={{ minWidth: 0 }}>
        <div className="tt">{tr('New plan from {0}', p.fromName)}</div>
        <div className="small muted">{tr(p.plan.routines.length === 1 ? '{0} routine' : '{0} routines', p.plan.routines.length)}</div>
      </div>
    </div>
    {p.note && <div className="small" style={{ marginBottom: 10, lineHeight: 1.4 }}>“{p.note}”</div>}
    <div className="row" style={{ gap: 8 }}>
      <Button variant="primary" size="sm" onClick={open}>{tr('See and add')}</Button>
      <Button variant="ghost" size="sm" className="dim" onClick={done}>{tr('Dismiss')}</Button>
    </div>
  </div>
}

export { canTrain }
