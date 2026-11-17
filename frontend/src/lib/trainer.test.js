import { describe, expect, it } from 'vitest'
import { planForStudent } from './trainer.js'
import { parsePlan } from './plan-share.js'

const S = {
  unit: 'kg',
  routines: [
    { id: 'a', name: 'Treino A', ex: [{ id: '0001', sets: 3, reps: 10 }, { id: 'c1', sets: 2, reps: 12 }] },
    { id: 'b', name: 'Treino B', ex: [{ id: 'c2', sets: 3, reps: 8 }] }
  ],
  week: { 1: ['a'], 2: ['b'], 4: ['a', 'b'] },
  customEx: [{ id: 'c1', n: 'Cadeira da casa', bp: 'upper legs' }, { id: 'c2', n: 'Puxada da casa', bp: 'back' }]
}

describe('planForStudent', () => {
  it('leva só as rotinas escolhidas, seus exercícios próprios e os dias em que caem', () => {
    const plan = planForStudent(S, ['a'], { name: 'Ficha' })
    expect(plan.routines.map(r => r.id)).toEqual(['a'])
    expect(plan.customEx.map(c => c.id)).toEqual(['c1'])
    expect(plan.week).toEqual({ 1: ['a'], 4: ['a'] })
    // o que sai é um arquivo de plano que o importador do aluno aceita
    const parsed = parsePlan(JSON.parse(JSON.stringify(plan)), 'kg')
    expect(parsed.routineCount).toBe(1)
    expect(parsed.dropped).toBe(0)
    expect(parsed.scheduledDays).toBe(2)
  })

  it('sem a semana, o aluno recebe as rotinas e mantém os próprios dias', () => {
    expect(planForStudent(S, ['a', 'b'], { week: false }).week).toEqual({})
  })
})
