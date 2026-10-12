const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
export function queryPath(mode, page, filters = {}) {
  if (!['stock', 'movements'].includes(mode) || !Number.isInteger(page) || page < 1 || page > 1000000) throw Error('Filtros invalidos.');
  const params = new URLSearchParams({ page: String(page), limit: '20' });
  const allowed = mode === 'stock' ? ['lotId', 'expired'] : ['lotId', 'from', 'to'];
  for (const [key, raw] of Object.entries(filters)) {
    if (!allowed.includes(key)) throw Error('Filtros invalidos.');
    const value = String(raw).trim(); if (!value) continue;
    if (key === 'lotId' && !uuid.test(value)) throw Error('El ID de lote debe ser un UUID valido.');
    if (key === 'expired' && !['true', 'false'].includes(value)) throw Error('Estado de vencimiento invalido.');
    if (['from', 'to'].includes(key) && (!/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T00:00:00Z`)) || new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) !== value)) throw Error('Fecha invalida.');
    params.set(key, value);
  }
  if (params.has('from') && params.has('to') && params.get('from') > params.get('to')) throw Error('La fecha inicial debe preceder a la final.');
  return `/api/v1/${mode}?${params}`;
}
export function inventoryModel(request, changed = () => {}, canMovements = false) {
  let disposed = false, generation = 0, referenced = false;
  let state = { mode: 'stock', page: 1, filters: {}, data: [], total: 0, pages: 1, loading: false, error: '', selected: null, medications: {}, suppliers: {}, referenceWarning: '' };
  const update = patch => { if (!disposed) { state = { ...state, ...patch }; changed(state); } };
  async function references() {
    if (referenced || disposed) return; referenced = true;
    update({ referenceWarning: '' });
    for (const [key, endpoint] of [['medications', 'medications'], ['suppliers', 'suppliers']]) {
      try {
        const result = await request(`/api/v1/${endpoint}?page=1&limit=100`);
        if (!Array.isArray(result.data) || result.data.length > 100) throw Error('Invalid references');
        update({ [key]: Object.fromEntries(result.data.filter(item => typeof item.id === 'string' && typeof item.name === 'string').map(item => [item.id, item.name])) });
      } catch { referenced = false; update({ referenceWarning: 'Algunas referencias no estan disponibles; se muestran sus IDs.' }); }
      if (disposed) return;
    }
  }
  async function load(page = state.page, mode = state.mode, filters = state.filters) {
    if (disposed) return;
    let path;
    try { if (mode === 'movements' && !canMovements) throw Error('No tienes permiso para ver movimientos.'); path = queryPath(mode, page, filters); }
    catch (error) { update({ error: error.message }); return; }
    const version = ++generation; update({ page, mode, filters: { ...filters }, loading: true, error: '', data: [], selected: null });
    try {
      const result = await request(path);
      if (disposed || version !== generation) return;
      if (!Array.isArray(result.data) || result.data.length > 20 || result.meta?.page !== page || result.meta?.limit !== 20 || !Number.isSafeInteger(result.meta.total) || result.meta.total < 0) throw Error('Invalid inventory response');
      for (const row of result.data) {
        if (!uuid.test(row.lotId) || typeof row.lotNumber !== 'string' || !uuid.test(row.medicationId) || !uuid.test(row.supplierId)) throw Error('Invalid inventory row');
        if (mode === 'stock' ? ![row.onHandQuantity, row.availableQuantity, row.pendingQuantity].every(value => Number.isSafeInteger(value) && value >= 0) || typeof row.expired !== 'boolean' || !/^\d{4}-\d{2}-\d{2}$/.test(row.expiresOn) : !uuid.test(row.id) || !['ENTRY', 'EXIT'].includes(row.type) || !Number.isSafeInteger(row.quantity) || !Number.isFinite(Date.parse(row.createdAt))) throw Error('Invalid inventory row');
      }
      update({ loading: false, data: result.data, total: result.meta.total, pages: Math.max(1, Math.ceil(result.meta.total / 20)) }); await references();
    } catch (error) { if (version === generation) update({ loading: false, error: error.status === 403 ? 'No tienes permiso para consultar esta vista.' : 'No fue posible cargar Inventario.' }); }
  }
  return { load, snapshot: () => state, select(row) { update({ selected: row }); }, dispose() { disposed = true; generation++; } };
}
