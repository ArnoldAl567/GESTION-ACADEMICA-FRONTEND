import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModuloId, Resumen } from '../../modelos/academicos.modelos';

interface IndicadorPanel {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone: string;
}

@Component({
  selector: 'app-panel',
  imports: [CommonModule],
  templateUrl: './panel.component.html',
})
export class PanelComponent {
  @Input({ required: true }) resumen!: Resumen;
  @Input({ required: true }) indicadores: IndicadorPanel[] = [];
  @Input({ required: true }) colores: readonly string[] = [];
  @Input({ required: true }) fecha = '';
  @Input({ required: true }) anio = 0;
  @Input({ required: true }) periodo = '';
  @Input({ required: true }) rol = '';
  @Input({ required: true }) graficoCircular = '';
  @Input() cargando = false;
  @Input() esAdministrador = false;

  @Output() actualizar = new EventEmitter<void>();
  @Output() navegar = new EventEmitter<ModuloId>();
  @Output() nuevaMatricula = new EventEmitter<void>();

  puntosSemanales(ausentes = false): string {
    return this.resumen.weekly.map((registro, index) => {
      const x = 35 + index * 930 / Math.max(this.resumen.weekly.length - 1, 1);
      const porcentaje = registro.total
        ? 100 * (ausentes ? registro.absent : registro.present) / registro.total
        : 0;
      return `${x},${230 - porcentaje * 2}`;
    }).join(' ');
  }
}
