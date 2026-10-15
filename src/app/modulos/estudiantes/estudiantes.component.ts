import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { EstadoVacioComponent } from '../../componentes/interfaz/estado-vacio.component';
import { FiltroActivo, FiltrosActivosComponent } from '../../componentes/interfaz/filtros-activos.component';
import { Aula, Estudiante, Matricula } from '../../modelos/academicos.modelos';

@Component({
  selector: 'app-estudiantes', standalone: true,
  imports: [CommonModule, FormsModule, SelectorGradoSeccionComponent, EstadoVacioComponent, FiltrosActivosComponent],
  templateUrl: './estudiantes.component.html',
})
export class EstudiantesComponent {
  @Input() estudiantes: Estudiante[] = [];
  @Input() aulas: Aula[] = [];
  @Input() total = 0;
  @Input() anio = 0;
  @Input() administrador = false;
  @Input() familia = false;
  @Input() ocupado = false;
  @Input() busqueda = '';
  @Input() estado = '';
  @Input() grado = 0;
  @Input() aulaId: number | null = null;
  @Output() busquedaChange = new EventEmitter<string>();
  @Output() estadoChange = new EventEmitter<string>();
  @Output() gradoChange = new EventEmitter<number>();
  @Output() aulaIdChange = new EventEmitter<number|null>();
  @Output() buscar = new EventEmitter<void>();
  @Output() crear = new EventEmitter<void>();
  @Output() ver = new EventEmitter<Estudiante>();
  @Output() editar = new EventEmitter<Estudiante>();
  @Output() eliminar = new EventEmitter<Estudiante>();

  get filtrosActivos(): FiltroActivo[] {
    const filtros: FiltroActivo[] = [];
    if (this.busqueda) filtros.push({etiqueta: 'Búsqueda', valor: this.busqueda});
    if (this.grado) filtros.push({etiqueta: 'Grado', valor: `${this.grado}°`});
    const aula = this.aulas.find(item => item.id === Number(this.aulaId));
    if (aula) filtros.push({etiqueta: 'Sección', valor: aula.section});
    if (this.estado) filtros.push({etiqueta: 'Estado', valor: this.estado});
    return filtros;
  }

  limpiarFiltros(): void {
    this.busquedaChange.emit(''); this.estadoChange.emit(''); this.gradoChange.emit(0); this.aulaIdChange.emit(null); this.buscar.emit();
  }

  matricula(estudiante:Estudiante):Matricula|undefined{return estudiante.enrollments?.find(item=>item.year===Number(this.anio));}
  iniciales(nombre:string):string{return nombre.split(' ').filter(Boolean).slice(0,2).map(value=>value[0]).join('');}
}
