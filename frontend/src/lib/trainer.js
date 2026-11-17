// Center Gym: o professor monta fichas na própria conta e as envia a um aluno; o aluno as
// encontra numa caixa de entrada e as incorpora pelo mesmo caminho de "importar plano".
//
// Dois transportes com a mesma interface: a API (api/server.js, rotas /api/trainer/* e
// /api/plan-inbox) e, na versão de demonstração, o localStorage deste navegador — a prévia não
// tem servidor, então os alunos são fictícios e "Você" é o único que recebe de verdade.
import { api } from './api.js'
import { DEMO } from './demo.js'
import { buildPlanBundle } from './plan-share.js'
import { isoOf } from './format.js'

/** A ficha a enviar: só as rotinas escolhidas, com os exercícios próprios que elas usam e,
 *  se pedido, os dias da semana em que caem. Mesmo formato do arquivo de plano. */
export function planForStudent(S, routineIds, { week = true, name = '' } = {}) {
  const ids = new Set(routineIds)
  const full = buildPlanBundle(S, name)
  const routines = full.routines.filter(r => ids.has(r.id))
  const used = new Set(routines.flatMap(r => r.ex.map(e => e.id)))
  const days = {}
  if (week) for (const [d, list] of Object.entries(full.week)) {
    const kept = list.filter(id => ids.has(id))
    if (kept.length) days[d] = kept
  }
  return { ...full, routines, week: days, customEx: full.customEx.filter(c => used.has(c.id)) }
}

/* ------------------------------ demonstração ------------------------------ */
const KEY = 'gym_demo_trainer_v1'
export const DEMO_SELF = 'voce'
const ago = days => isoOf(new Date(Date.now() - days * 86400000))
const DEMO_STUDENTS = [
  { id: 'd1', name: 'Ana Souza', workouts: 42, last: 1, routines: ['Treino A — Inferiores', 'Treino B — Superiores', 'Treino C — Glúteos'] },
  { id: 'd2', name: 'Bruno Lima', workouts: 17, last: 3, routines: ['Peito e tríceps', 'Costas e bíceps', 'Pernas'] },
  { id: 'd3', name: 'Carla Mendes', workouts: 5, last: 12, routines: ['Adaptação — corpo todo'] },
  { id: 'd4', name: 'Diego Alves', workouts: 0, last: null, routines: [] }
]
const demoLoad = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} } }
const demoSave = d => { try { localStorage.setItem(KEY, JSON.stringify(d)) } catch { /* armazenamento cheio ou bloqueado */ } }

function demoStudents(S) {
  const d = demoLoad()
  const mine = S.workouts || []
  return [
    { id: DEMO_SELF, name: 'Você (este aparelho)', workouts: mine.length, lastWorkout: mine.at(-1)?.d || null, routines: (S.routines || []).length, pending: d.inbox?.ts || null },
    ...DEMO_STUDENTS.map(s => ({ id: s.id, name: s.name, workouts: s.workouts, lastWorkout: s.last == null ? null : ago(s.last), routines: s.routines.length, pending: d.sent?.[s.id] || null }))
  ]
}

function demoStudent(S, id) {
  const d = demoLoad()
  if (id === DEMO_SELF) return {
    student: { id, name: 'Você (este aparelho)' },
    routines: (S.routines || []).map(r => ({ id: r.id, name: r.name, emoji: r.emoji, count: (r.ex || []).length })),
    workouts: (S.workouts || []).slice(-12).reverse().map(w => ({ id: w.id, d: w.d, name: w.name })),
    pending: d.inbox?.ts || null
  }
  const s = DEMO_STUDENTS.find(x => x.id === id)
  if (!s) throw new Error('Aluno não encontrado')
  return {
    student: { id, name: s.name },
    routines: s.routines.map((name, i) => ({ id: id + i, name, count: 6 + i })),
    workouts: s.last == null ? [] : Array.from({ length: Math.min(s.workouts, 6) }, (_, i) => ({ id: id + 'w' + i, d: ago(s.last + i * 2), name: s.routines[i % s.routines.length] })),
    pending: d.sent?.[id] || null
  }
}

/* ------------------------------ interface ------------------------------ */
export const canTrain = user => DEMO || !!user?.trainer

export const listStudents = async S => DEMO ? demoStudents(S) : (await api('/api/trainer/students')).students

export const getStudent = async (S, id) => DEMO ? demoStudent(S, id) : api('/api/trainer/student?id=' + encodeURIComponent(id))

export async function sendPlan(id, plan, note) {
  if (!DEMO) return api('/api/trainer/plan', { method: 'POST', body: JSON.stringify({ id, plan, note }) })
  const d = demoLoad(), ts = Date.now()
  if (id === DEMO_SELF) d.inbox = { fromName: 'Professor (demonstração)', ts, note: note || '', plan }
  else d.sent = { ...d.sent, [id]: ts }
  demoSave(d)
  return { ok: true, ts }
}

/** O treino que um professor enviou a esta conta, ou null. Um visitante sem conta não tem caixa. */
export async function fetchInbox(user) {
  if (DEMO) return demoLoad().inbox || null
  if (!user) return null
  return (await api('/api/plan-inbox')).pending
}

export async function clearInbox(ts) {
  if (!DEMO) return api('/api/plan-inbox/done', { method: 'POST', body: JSON.stringify({ ts }) })
  const d = demoLoad()
  if (d.inbox?.ts === ts) { delete d.inbox; demoSave(d) }
}
