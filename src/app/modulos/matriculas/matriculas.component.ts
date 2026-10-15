import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { EstadoVacioComponent } from '../../componentes/interfaz/estado-vacio.component';
import { FiltroActivo, FiltrosActivosComponent } from '../../componentes/interfaz/filtros-activos.component';
import { Aula, Matricula, Resumen } from '../../modelos/academicos.modelos';

@Component({selector:'app-matriculas',standalone:true,imports:[CommonModule,FormsModule,SelectorGradoSeccionComponent,EstadoVacioComponent,FiltrosActivosComponent],templateUrl:'./matriculas.component.html'})
export class MatriculasComponent {
  @Input() matriculas:Matricula[]=[];@Input() aulas:Aula[]=[];@Input() resumen!:Resumen;@Input() anio=0;@Input() administrador=false;@Input() ocupado=false;@Input() estado='';@Input() grado=0;@Input() aulaId:number|null=null;
  @Output() estadoChange=new EventEmitter<string>();@Output() gradoChange=new EventEmitter<number>();@Output() aulaIdChange=new EventEmitter<number|null>();@Output() buscar=new EventEmitter<void>();@Output() crear=new EventEmitter<void>();@Output() ver=new EventEmitter<Matricula>();@Output() editar=new EventEmitter<Matricula>();@Output() eliminar=new EventEmitter<Matricula>();@Output() alternarEstado=new EventEmitter<Matricula>();@Output() imprimir=new EventEmitter<void>();
  get filtrosActivos():FiltroActivo[]{const filtros:FiltroActivo[]=[];if(this.grado)filtros.push({etiqueta:'Grado',valor:`${this.grado}°`});const aula=this.aulas.find(item=>item.id===Number(this.aulaId));if(aula)filtros.push({etiqueta:'Sección',valor:aula.section});if(this.estado)filtros.push({etiqueta:'Estado',valor:this.estado});return filtros;}
  limpiarFiltros():void{this.estadoChange.emit('');this.gradoChange.emit(0);this.aulaIdChange.emit(null);this.buscar.emit();}
}
