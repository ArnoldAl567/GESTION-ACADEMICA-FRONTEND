import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface FiltroActivo {
  etiqueta: string;
  valor: string;
}

@Component({
  selector: 'app-filtros-activos',
  standalone: true,
  template: `
    @if (filtros.length) {
      <div class="active-filters" aria-label="Filtros activos">
        <span class="active-filters-title"><i class="material-symbols-rounded">filter_alt</i>Filtros activos</span>
        @for (filtro of filtros; track filtro.etiqueta) {<span class="filter-chip"><b>{{ filtro.etiqueta }}:</b> {{ filtro.valor }}</span>}
        <button type="button" class="clear-filters" (click)="limpiar.emit()"><span class="material-symbols-rounded">filter_alt_off</span>Limpiar filtros</button>
      </div>
    }
  `,
})
export class FiltrosActivosComponent {
  @Input() filtros: FiltroActivo[] = [];
  @Output() limpiar = new EventEmitter<void>();
}
