import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-estado-vacio',
  standalone: true,
  template: `
    <div class="empty-state-panel" role="status">
      <span class="material-symbols-rounded">{{ icono }}</span>
      <strong>{{ titulo }}</strong>
      <p>{{ mensaje }}</p>
      @if (accion) {<button type="button" class="secondary" (click)="activar.emit()">{{ accion }}</button>}
    </div>
  `,
})
export class EstadoVacioComponent {
  @Input() icono = 'inbox';
  @Input() titulo = 'No hay registros';
  @Input() mensaje = 'Todavía no hay información para mostrar.';
  @Input() accion = '';
  @Output() activar = new EventEmitter<void>();
}
