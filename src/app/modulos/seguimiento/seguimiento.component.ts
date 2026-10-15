import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { EstadoVacioComponent } from '../../componentes/interfaz/estado-vacio.component';
import { Aula, LibretaAcademica, PeriodoAcademico } from '../../modelos/academicos.modelos';

@Component({
  selector: 'app-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorGradoSeccionComponent, EstadoVacioComponent],
  templateUrl: './seguimiento.component.html',
})
export class SeguimientoComponent {
  @Input() libretas: LibretaAcademica[] = [];
  @Input() aulas: Aula[] = [];
  @Input() periodos: PeriodoAcademico[] = [];
  @Input() aulaId = 0;
  @Input() periodo = 0;
  @Input() personal = false;
  @Input() ocupado = false;
  @Input() periodoCerrado = false;

  @Output() aulaIdChange = new EventEmitter<number>();
  @Output() periodoChange = new EventEmitter<number>();
  @Output() recargar = new EventEmitter<void>();
  @Output() imprimir = new EventEmitter<void>();
  @Output() observar = new EventEmitter<LibretaAcademica>();
  @Output() descargar = new EventEmitter<LibretaAcademica>();

  iniciales(nombre: string): string {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map(value => value[0]).join('');
  }
}
