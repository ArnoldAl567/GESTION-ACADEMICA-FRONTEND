import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { EstadoVacioComponent } from '../../componentes/interfaz/estado-vacio.component';
import { Aula, EstadoAsistencia, Matricula } from '../../modelos/academicos.modelos';

@Component({selector:'app-asistencia',standalone:true,imports:[CommonModule,FormsModule,SelectorGradoSeccionComponent,EstadoVacioComponent],templateUrl:'./asistencia.component.html'})
export class AsistenciaComponent {
  @Input() aulas:Aula[]=[];@Input() aulaId=0;@Input() fecha='';@Input() filas:Matricula[]=[];@Input() estados:EstadoAsistencia[]=[];@Input() asistencia:Record<number,EstadoAsistencia|''>={};@Input() personal=false;@Input() ocupado=false;
  @Output() aulaIdChange=new EventEmitter<number>();@Output() fechaChange=new EventEmitter<string>();@Output() recargar=new EventEmitter<void>();@Output() guardar=new EventEmitter<void>();@Output() marcar=new EventEmitter<{id:number;estado:EstadoAsistencia}>();@Output() marcarTodos=new EventEmitter<EstadoAsistencia>();
  etiqueta(estado:EstadoAsistencia):string{return {P:'Presente',F:'Falta',T:'Tardanza',J:'Justificado'}[estado];}
  get conteos():Record<EstadoAsistencia,number>{const values={P:0,F:0,T:0,J:0};Object.values(this.asistencia).forEach(value=>{if(value)values[value]++;});return values;}
  get aula():Aula|undefined{return this.aulas.find(item=>item.id===Number(this.aulaId));}
  get aulaLabel():string{return this.aula?`${this.aula.grade}° — Sec. ${this.aula.section}`:'Selecciona grado y sección';}
  iniciales(nombre:string):string{return nombre.split(' ').filter(Boolean).slice(0,2).map(value=>value[0]).join('');}
}
