import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { EstadoVacioComponent } from '../../componentes/interfaz/estado-vacio.component';
import { Aula, Evaluacion, PeriodoAcademico } from '../../modelos/academicos.modelos';

@Component({
  selector: 'app-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectorGradoSeccionComponent, EstadoVacioComponent],
  templateUrl: './evaluaciones.component.html',
})
export class EvaluacionesComponent {
  @Input() evaluaciones: Evaluacion[] = [];
  @Input() aulas: Aula[] = [];
  @Input() periodos: PeriodoAcademico[] = [];
  @Input() aulaId = 0;
  @Input() periodo = 0;
  @Input() personal = false;
  @Input() administrador = false;
  @Input() ocupado = false;
  @Input() periodoCerrado = false;

  @Output() aulaIdChange = new EventEmitter<number>();
  @Output() periodoChange = new EventEmitter<number>();
  @Output() recargar = new EventEmitter<void>();
  @Output() crear = new EventEmitter<void>();
  @Output() calificar = new EventEmitter<Evaluacion>();
  @Output() editar = new EventEmitter<Evaluacion>();
  @Output() eliminar = new EventEmitter<Evaluacion>();

  pesoCurso(evaluacion:Evaluacion):number {
    return this.evaluaciones
      .filter(item=>item.course_id===evaluacion.course_id&&item.status!=='Cancelada')
      .reduce((total,item)=>total+Number(item.weight),0);
  }
}
