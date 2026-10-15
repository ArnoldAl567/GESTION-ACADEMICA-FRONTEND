import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  template: `
    <div class="toast-region" aria-live="polite" aria-atomic="true">
      @if (error) {<div class="app-toast error" role="alert"><span class="material-symbols-rounded">error</span><p><strong>No se pudo completar la acción</strong>{{ error }}</p><button aria-label="Cerrar error" (click)="cerrarError.emit()">×</button></div>}
      @if (exito) {<div class="app-toast success" role="status"><span class="material-symbols-rounded">check_circle</span><p><strong>Acción completada</strong>{{ exito }}</p><button aria-label="Cerrar notificación" (click)="cerrarExito.emit()">×</button></div>}
    </div>
  `,
})
export class NotificacionesComponent {
  @Input() error = '';
  @Input() exito = '';
  @Output() cerrarError = new EventEmitter<void>();
  @Output() cerrarExito = new EventEmitter<void>();
}
