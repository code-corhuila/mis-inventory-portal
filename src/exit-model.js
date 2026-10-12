const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function exitBody(draft, lot) {
  const body = { lotId: draft.lotId, quantity: Number(draft.quantity), reason: String(draft.reason || '').trim() };
  if (!uuid.test(body.lotId) || !Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > 1000000) throw Error('Lote o cantidad invalidos.');
  if (!body.reason || [...body.reason].length > 200 || /[\u0000-\u001f\u007f-\u009f]/.test(body.reason)) throw Error('El motivo es obligatorio y admite hasta 200 caracteres sin controles.');
  if (lot && (lot.lotId !== body.lotId || lot.expired || body.quantity > lot.availableQuantity)) throw Error('El lote esta vencido o la cantidad supera el stock disponible.');
  return body;
}
export function exitModel(request, store, changed = () => {}, confirmed = () => {}) {
  let disposed = false;
  let state = { open: !!store.pending, lot: store.pending?.lot || null, busy: false, locked: !!store.pending, result: store.pending?.result || null, error: '' };
  const update = patch => { if (!disposed) { state = { ...state, ...patch }; changed(state); } };
  async function create(draft) {
    if (disposed || state.busy || state.result) return;
    let body;
    try { body = JSON.stringify(exitBody(draft, store.pending ? null : state.lot)); }
    catch (error) { update({ error: error.message }); return; }
    if (!state.lot) { update({ error: 'Selecciona un lote antes de registrar la salida.' }); return; }
    if (store.pending && store.pending.body !== body) { update({ error: 'Reintenta la salida original sin modificar los datos.' }); return; }
    store.pending ||= { key: crypto.randomUUID(), body, lot: { ...state.lot }, result: null };
    const intent = store.pending, expected = JSON.parse(intent.body); update({ busy: true, locked: true, error: '' });
    try {
      const result = await request('/api/v1/exits', { method: 'POST', headers: { 'Idempotency-Key': intent.key }, body: intent.body });
      if (disposed) return;
      if (!uuid.test(result?.id) || result.lotId !== expected.lotId || result.quantity !== expected.quantity || result.reason !== expected.reason || !Number.isSafeInteger(result.remainingQuantity) || result.remainingQuantity < 0) throw Error('Invalid exit acknowledgement');
      intent.result = result; update({ busy: false, result });
      try { await confirmed(); } catch { update({ error: 'Salida confirmada; no fue posible actualizar las existencias.' }); }
    } catch (error) {
      if (disposed) return;
      const definitive = [400, 403, 422].includes(error.status); if (definitive) store.pending = null;
      update({ busy: false, locked: !definitive, error: error.status === 422 ? 'Stock insuficiente o lote vencido. Actualiza y revisa los datos.' : error.status === 403 ? 'No tienes permiso para registrar salidas.' : definitive ? 'Revisa los datos de la salida.' : 'No se confirmo la salida. Reintenta el mismo envio.' });
    }
  }
  return { create, snapshot: () => state,
    begin(lot) { if (disposed || state.busy || store.pending) { update({ error: 'Resuelve la salida actual antes de elegir otro lote.' }); return false; } if (lot.expired || lot.availableQuantity < 1) return false; update({ open: true, lot: { ...lot }, locked: false, result: null, error: '' }); return true; },
    close() { if (!state.busy && !store.pending) update({ open: false, lot: null, error: '' }); },
    reset() { if (!state.busy && (!store.pending || store.pending.result)) { store.pending = null; update({ open: false, lot: null, locked: false, result: null, error: '' }); return true; } return false; },
    dispose() { disposed = true; }
  };
}
