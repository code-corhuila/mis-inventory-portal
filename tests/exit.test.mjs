import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exitBody, exitModel } from '../src/exit-model.js';
const id = '11111111-1111-4111-8111-111111111111';
const lot = { lotId: id, lotNumber: 'FIXTURE', expired: false, availableQuantity: 7 };
const draft = { lotId: id, quantity: 5, reason: ' Synthetic exit ' };
const result = { id, lotId: id, quantity: 5, reason: 'Synthetic exit', remainingQuantity: 2 };
test('validates quantity, reason and eligibility for a new exit', () => {
  assert.equal(exitBody(draft, lot).reason, 'Synthetic exit');
  for (const patch of [{ quantity: 0 }, { quantity: 1.5 }, { quantity: 1000001 }, { quantity: 8 }, { reason: '' }, { reason: 'x\n' + 'y' }, { reason: 'x'.repeat(201) }]) assert.throws(() => exitBody({ ...draft, ...patch }, lot));
  assert.throws(() => exitBody(draft, { ...lot, expired: true }));
});
test('unknown reply keeps key/body through remount even when balance is now lower', async () => {
  const store = { pending: null }, calls = []; let lost = true, refresh = 0;
  const request = async (path, options) => { calls.push(options); if (lost) throw Error('lost reply'); return result; };
  const first = exitModel(request, store); first.begin(lot); await first.create(draft); assert.equal(first.reset(), false); first.dispose(); store.pending.lot.availableQuantity = 2; lost = false;
  const second = exitModel(request, store, undefined, () => { refresh++; }); await second.create(draft);
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']); assert.equal(calls[0].body, calls[1].body); assert.equal(second.snapshot().result.remainingQuantity, 2); assert.equal(refresh, 1); assert.equal(second.reset(), true);
});
test('duplicate click and mutation of an uncertain intention are blocked', async () => {
  let resolve, calls = 0; const pending = new Promise(done => { resolve = done; }); const store = { pending: null };
  const model = exitModel(async () => { calls++; return pending; }, store); model.begin(lot);
  const first = model.create(draft); await model.create(draft); assert.equal(calls, 1); resolve(result); await first;
  const unknown = exitModel(async () => { calls++; throw Error('lost'); }, { pending: null }); unknown.begin(lot); await unknown.create(draft);
  await unknown.create({ ...draft, quantity: 1 }); assert.equal(calls, 2); assert.equal(unknown.begin({ ...lot, lotId: '22222222-2222-4222-8222-222222222222' }), false);
});
test('definitive rejection allows a corrected new intention', async () => {
  const keys = []; const model = exitModel(async (path, options) => { keys.push(options.headers['Idempotency-Key']); if (keys.length === 1) throw Object.assign(Error('insufficient'), { status: 422 }); return result; }, { pending: null });
  model.begin(lot); await model.create(draft); assert.equal(model.snapshot().locked, false); await model.create(draft); assert.notEqual(keys[0], keys[1]); assert.ok(model.snapshot().result);
});
test('malformed acknowledgement stays uncertain, while refresh failure does not negate a confirmed write', async () => {
  const invalid = exitModel(async () => ({ ...result, quantity: 4 }), { pending: null }); invalid.begin(lot); await invalid.create(draft); assert.equal(invalid.snapshot().result, null); assert.equal(invalid.snapshot().locked, true);
  const valid = exitModel(async () => result, { pending: null }, undefined, () => { throw Error('read failed'); }); valid.begin(lot); await valid.create(draft); assert.equal(valid.snapshot().result.id, id); assert.match(valid.snapshot().error, /Salida confirmada/);
});
test('disposed write cannot publish state or discard its pending key', async () => {
  let resolve; const store = { pending: null }; const model = exitModel(() => new Promise(done => { resolve = done; }), store); model.begin(lot);
  const pending = model.create(draft); model.dispose(); resolve(result); await pending; assert.ok(store.pending); assert.equal(store.pending.result, null);
});
