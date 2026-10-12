import '@angular/compiler';
import { Component, ChangeDetectionStrategy, ViewEncapsulation, createComponent, signal, provideZonelessChangeDetection } from '@angular/core';
import { createApplication } from '@angular/platform-browser';
import { inventoryModel } from './model.js';
import styles from './styles.js';
import { exitModel } from './exit-model.js';
class InventoryPortal {
  state = signal({ mode: 'stock', loading: true, page: 1, data: [], total: 0, pages: 1, error: '', selected: null, medications: {}, suppliers: {} });
  model; filters = {}; canMovements = false; canExit = false; exits; exitDraft = {};
  exitState = signal({ open: false, busy: false, locked: false, result: null, error: '', lot: null });
  initialize(context) {
    this.canMovements = context.canMovements; this.canExit = context.canExit;
    this.model = inventoryModel(context.request, value => this.state.set(value), this.canMovements);
    if (this.canExit) { this.exits = exitModel(context.request, context.exits, value => this.exitState.set(value), () => this.model.load()); this.exitState.set(this.exits.snapshot()); if (context.exits.pending) this.exitDraft = JSON.parse(context.exits.pending.body); }
    this.model.load();
  }
  beginExit(row) { if (this.exits.begin(row)) this.exitDraft = { lotId: row.lotId, quantity: 1, reason: '' }; }
  submitExit(event) { event.preventDefault(); this.exits.create(this.exitDraft); }
  quantityLimit() { return this.exitState().locked ? 1000000 : Math.min(1000000, this.exitState().lot.availableQuantity); }
  switchMode(mode) { this.filters = {}; this.model.load(1, mode, {}); }
  apply(event) { event.preventDefault(); this.model.load(1, this.state().mode, this.filters); }
  medication(row) { return this.state().medications[row.medicationId] || row.medicationId; }
  supplier(row) { return this.state().suppliers[row.supplierId] || row.supplierId; }
  timestamp(value) { return new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bogota' }).format(new Date(value)); }
  ngOnDestroy() { this.model?.dispose(); this.exits?.dispose(); }
}
Component({ selector: 'mis-inventory', standalone: true, encapsulation: ViewEncapsulation.ShadowDom, changeDetection: ChangeDetectionStrategy.OnPush, styles: [styles], template: `
  <section aria-labelledby="inventory-title">
    <div class="heading"><div><p class="eyebrow">LOTES Y TRAZABILIDAD</p><h1 id="inventory-title">Inventario</h1></div><button (click)="model.load()" [disabled]="state().loading">Actualizar</button></div>
    <div class="modes" role="tablist" aria-label="Consultas de inventario"><button role="tab" [attr.aria-selected]="state().mode === 'stock'" (click)="switchMode('stock')">Existencias</button>@if (canMovements) { <button role="tab" [attr.aria-selected]="state().mode === 'movements'" (click)="switchMode('movements')">Movimientos</button> }</div>
    @if (canExit && exitState().open) { <section class="detail" aria-labelledby="exit-title"><h2 id="exit-title">Salida de {{ exitState().lot.lotNumber }}</h2>
      @if (exitState().result; as result) { <p class="success" role="status">Salida registrada.</p><dl><dt>ID salida</dt><dd>{{ result.id }}</dd><dt>Cantidad descontada</dt><dd>{{ result.quantity }}</dd><dt>Saldo al registrar</dt><dd>{{ result.remainingQuantity }}</dd><dt>Motivo</dt><dd>{{ result.reason }}</dd></dl><button (click)="exits.reset()">Nueva salida</button> }
      @else { <p>Disponible al seleccionar: {{ exitState().lot.availableQuantity }}</p><form class="exit-form" (submit)="submitExit($event)"><label>Cantidad de salida<input name="exitQuantity" type="number" min="1" [max]="quantityLimit()" step="1" required [value]="exitDraft.quantity" [disabled]="exitState().busy || exitState().locked" (input)="exitDraft.quantity = $event.target.value"></label><label>Motivo de salida<input name="exitReason" maxlength="200" required [value]="exitDraft.reason" [disabled]="exitState().busy || exitState().locked" (input)="exitDraft.reason = $event.target.value"></label><button type="button" [disabled]="exitState().busy || exitState().locked" (click)="exits.close()">Cancelar salida</button><button type="submit" [disabled]="exitState().busy">{{ exitState().busy ? 'Registrando...' : exitState().locked ? 'Reintentar salida' : 'Confirmar salida' }}</button></form> }
      <p role="alert">{{ exitState().error }}</p>
    </section> }
    <form (submit)="apply($event)"><label>ID de lote (opcional)<input name="lotId" maxlength="36" [value]="filters.lotId || ''" (input)="filters.lotId = $event.target.value" placeholder="UUID del lote"></label>
      @if (state().mode === 'stock') { <label>Vencimiento<select name="expired" [value]="filters.expired || ''" (change)="filters.expired = $event.target.value"><option value="">Todos</option><option value="false">Vigentes</option><option value="true">Vencidos</option></select></label> }
      @else { <label>Desde<input name="from" type="date" [value]="filters.from || ''" (input)="filters.from = $event.target.value"></label><label>Hasta<input name="to" type="date" [value]="filters.to || ''" (input)="filters.to = $event.target.value"></label> }
      <button type="submit" [disabled]="state().loading">Aplicar filtros</button>
    </form>
    @if (state().loading) { <p role="status">Cargando inventario...</p> }
    @else if (state().error) { <div role="alert"><p>{{ state().error }}</p><button (click)="model.load()">Reintentar</button></div> }
    @else {
      <p class="summary">{{ state().total }} {{ state().mode === 'stock' ? 'lotes' : 'movimientos' }}</p>
      @if (!state().data.length) { <p role="status">No hay resultados para estos filtros.</p> }
      @else { <div class="table-scroll"><table><thead><tr><th scope="col">Lote / Medicamento</th>@if (state().mode === 'stock') { <th scope="col">Disponible</th><th scope="col">Pendiente</th><th scope="col">F&#237;sico</th><th scope="col">Vencimiento</th> } @else { <th scope="col">Tipo</th><th scope="col">Cantidad</th><th scope="col">Fecha (Bogot&#225;)</th> }<th scope="col">Ficha</th></tr></thead><tbody>
        @for (row of state().data; track state().mode === 'stock' ? row.lotId : row.id) { <tr><td><strong>{{ row.lotNumber }}</strong><small>{{ medication(row) }}</small></td>@if (state().mode === 'stock') { <td>{{ row.availableQuantity }}</td><td>{{ row.pendingQuantity }}</td><td>{{ row.onHandQuantity }}</td><td>{{ row.expiresOn }}<small [class.expired]="row.expired">{{ row.expired ? 'Vencido' : 'Vigente' }}</small></td> } @else { <td>{{ row.type === 'ENTRY' ? 'Entrada' : 'Salida' }}</td><td>{{ row.quantity }}</td><td>{{ timestamp(row.createdAt) }}</td> }<td><div class="lot-actions"><button [attr.aria-label]="'Ver ficha de lote ' + row.lotNumber" (click)="model.select(row)">Ver ficha</button>@if (canExit && state().mode === 'stock') { <button [attr.aria-label]="'Registrar salida de lote ' + row.lotNumber" [disabled]="row.expired || row.availableQuantity < 1 || exitState().locked || exitState().busy" (click)="beginExit(row)">Salida</button> }</div></td></tr> }
      </tbody></table></div> }
      <nav class="pagination" aria-label="Paginacion de inventario"><button [disabled]="state().page === 1" (click)="model.load(state().page - 1)">Anterior</button><span>P&#225;gina {{ state().page }} de {{ state().pages }}</span><button [disabled]="state().page >= state().pages" (click)="model.load(state().page + 1)">Siguiente</button></nav>
    }
    @if (state().referenceWarning) { <p role="status">{{ state().referenceWarning }}</p> }
    @if (state().selected; as row) { <section class="detail" aria-labelledby="lot-detail"><div class="heading"><h2 id="lot-detail">{{ row.lotNumber }}</h2><button (click)="model.select(null)">Cerrar ficha</button></div><dl><dt>Medicamento</dt><dd>{{ medication(row) }}</dd><dt>Proveedor</dt><dd>{{ supplier(row) }}</dd><dt>ID lote</dt><dd>{{ row.lotId }}</dd><dt>ID medicamento</dt><dd>{{ row.medicationId }}</dd><dt>ID proveedor</dt><dd>{{ row.supplierId }}</dd>@if (state().mode === 'movements') { <dt>ID movimiento</dt><dd>{{ row.id }}</dd><dt>Actor</dt><dd>{{ row.actor }}</dd> }</dl></section> }
  </section>` })(InventoryPortal);
export async function mount(host, context) {
  if (!(host instanceof HTMLElement) || typeof context?.request !== 'function') throw Error('Invalid inventory context');
  const application = await createApplication({ providers: [provideZonelessChangeDetection()] });
  try { const component = createComponent(InventoryPortal, { hostElement: host, environmentInjector: application.injector }); application.attachView(component.hostView); component.instance.initialize(context); component.changeDetectorRef.detectChanges(); }
  catch (error) { application.destroy(); host.replaceChildren(); throw error; }
  return () => { application.destroy(); host.replaceChildren(); };
}
