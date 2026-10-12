import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inventoryModel, queryPath } from '../src/model.js';
const id = '11111111-1111-4111-8111-111111111111';
const row = { lotId: id, medicationId: id, supplierId: id, lotNumber: 'DEMO-01', expiresOn: '2030-01-01', onHandQuantity: 10, availableQuantity: 10, pendingQuantity: 3, expired: false };
const page = { data: [row], meta: { page: 1, limit: 20, total: 25 } };
const references = { data: [{ id, name: 'Synthetic reference' }] };
test('validates stock/movement query filters and calendar dates', () => {
  assert.equal(queryPath('stock', 1, { expired: 'true', lotId: id }), `/api/v1/stock?page=1&limit=20&expired=true&lotId=${id}`);
  assert.throws(() => queryPath('stock', 1, { from: '2026-01-01' }));
  assert.throws(() => queryPath('movements', 1, { from: '2026-02-30' }));
  assert.throws(() => queryPath('movements', 1, { from: '2026-10-13', to: '2026-10-12' }));
  assert.throws(() => queryPath('stock', 1000001));
});
test('uses total, not absent totalPages; enriches names through owner APIs', async () => {
  const model = inventoryModel(async path => path.startsWith('/api/v1/stock?') ? page : references);
  await model.load(); assert.equal(model.snapshot().pages, 2); assert.equal(model.snapshot().data[0].pendingQuantity, 3);
  assert.equal(model.snapshot().medications[id], 'Synthetic reference');
});
test('consultation cannot request movements; failure/retry and empty results work', async () => {
  let calls = 0, fail = true;
  const model = inventoryModel(async path => { calls++; if (fail) throw Error('offline'); return path.startsWith('/api/v1/stock?') ? { data: [], meta: { page: 1, limit: 20, total: 0 } } : references; });
  await model.load(1, 'movements'); assert.equal(calls, 0);
  await model.load(); assert.ok(model.snapshot().error); fail = false; await model.load(); assert.equal(model.snapshot().total, 0); assert.equal(model.snapshot().error, '');
});
test('latest query wins and disposal ignores outstanding data', async () => {
  let resolve; const response = new Promise(done => { resolve = done; });
  const model = inventoryModel(async path => path === '/api/v1/stock?page=1&limit=20' ? response : path.startsWith('/api/v1/stock?') ? { ...page, meta: { ...page.meta, page: 2 } } : references);
  const pending = model.load(); await model.load(2); resolve(page); await pending; assert.equal(model.snapshot().page, 2);
  let late; const disposed = inventoryModel(() => new Promise(done => { late = done; })); const read = disposed.load(); disposed.dispose(); late(page); await read; assert.equal(disposed.snapshot().data.length, 0);
});
test('bad quantities are rejected; reference failures do not hide stock', async () => {
  const invalid = inventoryModel(async () => ({ ...page, data: [{ ...row, availableQuantity: -1 }] })); await invalid.load(); assert.ok(invalid.snapshot().error);
  let recovered = false;
  const fallback = inventoryModel(async path => { if (path.startsWith('/api/v1/stock?')) return page; if (recovered) return references; throw Error('owner unavailable'); }); await fallback.load(); assert.equal(fallback.snapshot().data.length, 1); assert.ok(fallback.snapshot().referenceWarning);
  recovered = true; await fallback.load(); assert.equal(fallback.snapshot().referenceWarning, '');
});
