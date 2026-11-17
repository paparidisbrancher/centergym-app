/* Center Gym: o professor envia um treino, o aluno o encontra na caixa de entrada. server.js real. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { boundPort } from './helpers.mjs';

const API = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const SECRET = crypto.randomBytes(32).toString('hex');
const session = uid => {
  const payload = `${uid}:${Date.now() + 86400000}:0`;
  return { Cookie: `gymsid=${payload}.${crypto.createHmac('sha256', SECRET).update(payload).digest('base64url')}`, 'Content-Type': 'application/json' };
};
const plan = { opengym_plan: 1, name: 'Ficha A', unit: 'kg', week: { 1: ['r1'] }, routines: [{ id: 'r1', name: 'Peito', ex: [{ id: '0001', sets: 3, reps: 10 }] }], customEx: [] };

test('professor envia treino; aluno recebe e limpa; aluno comum não acessa', async t => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gym-trainer-'));
  fs.writeFileSync(path.join(dataDir, 'secret'), SECRET, { mode: 0o600 });
  fs.writeFileSync(path.join(dataDir, 'db.json'), JSON.stringify({
    users: [{ id: 'u_adm', name: 'Dona', admin: true }, { id: 'u_prof', name: 'Prof' }, { id: 'u_aluno', name: 'Aluno' }, { id: 'u_off', name: 'Saiu', disabled: true }],
    creds: [], subs: [], invites: []
  }));
  fs.writeFileSync(path.join(dataDir, 'state-u_aluno.json'), JSON.stringify({ routines: [{ id: 'x', name: 'Antiga', ex: [] }], workouts: [{ id: 'w', d: '2026-11-10', name: 'Antiga' }], bodyweight: [{ d: '2026-11-01', w: 80 }] }));
  const child = spawn(process.execPath, ['server.js'], { cwd: API, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, PORT: '0', DATA_DIR: dataDir, ORIGIN: 'http://localhost:8080', RP_ID: 'localhost' } });
  let log = ''; child.stdout.on('data', d => log += d); child.stderr.on('data', d => log += d);
  t.after(() => { child.kill('SIGKILL'); fs.rmSync(dataDir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${await boundPort(child, () => log)}`;
  const call = async (uid, p, body) => {
    const r = await fetch(base + p, { method: body ? 'POST' : 'GET', headers: { ...session(uid), Origin: 'http://localhost:8080' }, body: body && JSON.stringify(body) });
    return { status: r.status, body: await r.json() };
  };

  assert.equal((await call('u_prof', '/api/trainer/students')).status, 403);          // ainda não é professor
  assert.equal((await call('u_prof', '/api/admin/user/trainer', { id: 'u_prof', trainer: true })).status, 403);
  assert.equal((await call('u_adm', '/api/admin/user/trainer', { id: 'u_prof', trainer: true })).body.trainer, true);
  assert.equal((await call('u_prof', '/api/me')).body.user.trainer, true);

  const list = (await call('u_prof', '/api/trainer/students')).body.students;
  assert.deepEqual(list.map(s => s.id).sort(), ['u_adm', 'u_aluno']);                 // sem ele mesmo, sem o desativado
  const one = (await call('u_prof', '/api/trainer/student?id=u_aluno')).body;
  assert.equal(one.routines[0].name, 'Antiga');
  assert.equal(one.bodyweight, undefined);                                            // peso é do aluno

  assert.equal((await call('u_prof', '/api/trainer/plan', { id: 'u_aluno', plan: { routines: [] } })).status, 400);
  assert.equal((await call('u_prof', '/api/trainer/plan', { id: 'u_off', plan })).status, 404);
  assert.equal((await call('u_aluno', '/api/trainer/plan', { id: 'u_prof', plan })).status, 403);
  const sent = await call('u_prof', '/api/trainer/plan', { id: 'u_aluno', plan, note: 'Comece leve' });
  assert.equal(sent.status, 200);

  const inbox = (await call('u_aluno', '/api/plan-inbox')).body.pending;
  assert.equal(inbox.fromName, 'Prof');
  assert.equal(inbox.note, 'Comece leve');
  assert.equal(inbox.plan.routines[0].name, 'Peito');
  assert.equal((await call('u_prof', '/api/plan-inbox')).body.pending, null);          // a caixa é de cada um

  await call('u_aluno', '/api/plan-inbox/done', { ts: inbox.ts - 1 });                 // ts de outro envio: fica
  assert.ok((await call('u_aluno', '/api/plan-inbox')).body.pending);
  await call('u_aluno', '/api/plan-inbox/done', { ts: inbox.ts });
  assert.equal((await call('u_aluno', '/api/plan-inbox')).body.pending, null);
});
