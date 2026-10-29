import { Component, Input, OnChanges, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicPeriod, Classroom, Enrollment, Competency } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../../servicios/api-academica.servicio';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
interface Nivel { enrollment_id:number; competency_id:number; level:string|null; conclusion:string|null; }
@Component({selector:'app-niveles-primaria',imports:[FormsModule,SelectorGradoSeccionComponent],template:`
<section class="page-heading"><div><h1>Calificaciones de primaria</h1><p>Niveles de logro por competencia: AD, A, B y C</p></div><button class="primary" [disabled]="ocupado||cerrado||!editable||!filas.length" (click)="guardar()">Guardar niveles</button></section>
<section class="card grade-controls"><app-selector-grado-seccion [aulas]="aulas" [aulaId]="aula" (aulaIdChange)="aula=$event||0" (cambio)="cargar()"/><label>Periodo<select [(ngModel)]="periodo" (ngModelChange)="cargar()">@for(p of periodos;track p.id){<option [ngValue]="p.id">{{p.name}} · {{p.status}}</option>}</select></label></section>
@if(mensaje){<p role="status">{{mensaje}}</p>}@if(cerrado){<p>Periodo cerrado: solo consulta.</p>}
<section class="card selector-alumna" aria-label="Seleccionar alumna para calificar">
  <label>Buscar alumna<input [(ngModel)]="busquedaAlumna" (ngModelChange)="alumnaId=0" placeholder="Escribe el nombre…"></label>
  <label>Alumna<select [ngModel]="alumnaActual?.id || 0" (ngModelChange)="alumnaId=$event" [disabled]="ocupado || !alumnasFiltradas.length">@for(a of alumnasFiltradas;track a.id){<option [ngValue]="a.id">{{a.student.name}}</option>}</select></label>
  <div class="avanzar-alumna"><button class="secondary" [disabled]="ocupado || indiceAlumna<=0" (click)="avanzar(-1)" aria-label="Alumna anterior">Anterior</button><span aria-live="polite">{{alumnasFiltradas.length ? indiceAlumna+1 : 0}} de {{alumnasFiltradas.length}}</span><button class="secondary" [disabled]="ocupado || indiceAlumna>=alumnasFiltradas.length-1" (click)="avanzar(1)" aria-label="Alumna siguiente">Siguiente</button></div>
</section>
@for(alumna of alumnasVisibles;track alumna.id){
  <section class="card" style="padding:20px;margin-bottom:16px">
    <h2>{{alumna.student.name}}</h2>
    @for(grupo of competenciasPorCurso;track grupo.id){
      <section class="grupo-curso" [attr.aria-labelledby]="'curso-'+alumna.id+'-'+grupo.id">
        <h3 [id]="'curso-'+alumna.id+'-'+grupo.id"><button class="abrir-curso" (click)="alternarCurso(grupo.id)" [attr.aria-expanded]="cursoVisible(grupo.id)" [attr.aria-controls]="'competencias-'+alumna.id+'-'+grupo.id"><span>{{grupo.nombre}}</span><small>{{registradas(alumna.id,grupo.id)}} / {{grupo.competencias.length}} registradas</small><span class="material-symbols-rounded">{{cursoVisible(grupo.id)?'expand_less':'expand_more'}}</span></button></h3>
        @if(cursoVisible(grupo.id)){
        <div [id]="'competencias-'+alumna.id+'-'+grupo.id">
        @for(c of grupo.competencias;track c.id){
          @if(fila(alumna.id,c.id);as n){
            <div style="display:flex;flex-wrap:wrap;gap:12px;margin:16px 0;align-items:center">
              <label style="flex:1;min-width:200px">{{c.name}}</label>
              <select [disabled]="!editable||cerrado||ocupado" [(ngModel)]="n.level" [attr.aria-label]="'Nivel de logro: '+c.name"><option [ngValue]="null">Sin registrar</option>@for(l of ['AD','A','B','C'];track l){<option>{{l}}</option>}</select>
              <textarea style="flex:1;min-width:200px" [disabled]="!editable||cerrado||ocupado" [(ngModel)]="n.conclusion" maxlength="4000" placeholder="Conclusión descriptiva" [attr.aria-label]="'Conclusión descriptiva: '+c.name"></textarea>
            </div>
          }
        }
        </div>
        }
      </section>
    }
  </section>
}@empty{<p class="empty-state">{{busquedaAlumna ? 'No hay alumnas que coincidan con la búsqueda.' : 'No hay alumnas matriculadas en esta aula.'}}</p>}`,styles:[`
  .grupo-curso{margin-top:14px}
  .grupo-curso h3{margin:0;border-left:4px solid #2563eb;border-radius:6px;background:var(--bg,#f1f5f9);color:var(--text,#1e293b);font-size:15px;font-weight:600}
  .abrir-curso{display:flex;align-items:center;gap:12px;width:100%;padding:14px;text-align:left;background:transparent;border:0;color:inherit;font:inherit}
  .abrir-curso small{margin-left:auto;font-size:11px;font-weight:400;color:var(--muted,#64748b)}
  .selector-alumna{display:flex;align-items:end;flex-wrap:wrap;gap:16px;padding:18px;margin-bottom:18px}
  .selector-alumna label{display:grid;gap:7px;font-size:12px;color:var(--muted,#64748b);flex:1;min-width:180px}
  .selector-alumna input,.selector-alumna select{width:100%;height:40px;padding:8px;border:1px solid var(--line,#dbe2ea);border-radius:8px;background:var(--card,#fff);color:var(--text,#1e293b)}
  .avanzar-alumna{display:flex;align-items:center;gap:12px;font-size:12px}
  @media(max-width:600px){.avanzar-alumna{width:100%;justify-content:space-between}.abrir-curso{flex-wrap:wrap}.abrir-curso small{margin-left:0}}
`]})
export class NivelesPrimariaComponent implements OnChanges {
 @Input() aulas:Classroom[]=[]; @Input() periodos:AcademicPeriod[]=[]; @Input() editable=false;
 private api=inject(ApiAcademicaServicio); private cdr=inject(ChangeDetectorRef);
 aula=0; periodo=0; alumnas:Enrollment[]=[]; competencias:Competency[]=[]; filas:Nivel[]=[]; ocupado=false; mensaje='';
 alumnaId=0; busquedaAlumna=''; cursoAbierto:number|null=null;
 get alumnasFiltradas(){const texto=this.busquedaAlumna.trim().toLocaleLowerCase('es');return this.alumnas.filter(a=>a.student.name.toLocaleLowerCase('es').includes(texto));}
 get alumnaActual():Enrollment|undefined{return this.alumnasFiltradas.find(a=>a.id===this.alumnaId)??this.alumnasFiltradas[0];}
 get alumnasVisibles(){return this.alumnaActual?[this.alumnaActual]:[];}
 get indiceAlumna(){return this.alumnasFiltradas.findIndex(a=>a.id===this.alumnaActual?.id);}
 avanzar(paso:number){const alumna=this.alumnasFiltradas[this.indiceAlumna+paso];if(alumna)this.alumnaId=alumna.id;}
 cursoVisible(id:number){return (this.cursoAbierto??this.competenciasPorCurso[0]?.id)===id;}
 alternarCurso(id:number){this.cursoAbierto=this.cursoVisible(id)?0:id;}
 registradas(alumna:number,curso:number){const ids=this.competencias.filter(c=>c.course_id===curso).map(c=>c.id);return this.filas.filter(n=>n.enrollment_id===alumna&&ids.includes(n.competency_id)&&!!n.level).length;}
 get cerrado(){return this.periodos.find(p=>p.id===this.periodo)?.status==='Cerrado';}
 get competenciasPorCurso(): { id:number; nombre:string; competencias:Competency[] }[] {
   const grupos = new Map<number, { id:number; nombre:string; competencias:Competency[] }>();
   for (const competencia of this.competencias) {
     let grupo = grupos.get(competencia.course_id);
     if (!grupo) {
       grupo = { id:competencia.course_id, nombre:competencia.course.name, competencias:[] };
       grupos.set(competencia.course_id, grupo);
     }
     grupo.competencias.push(competencia);
   }
   return [...grupos.values()];
 }
 ngOnChanges(){this.aula=this.aulas[0]?.id??0;this.periodo=this.periodos.find(p=>p.status==='Activo')?.id??this.periodos[0]?.id??0;void this.cargar();}
 fila(e:number,c:number){return this.filas.find(n=>n.enrollment_id===e&&n.competency_id===c);}
 async cargar(){if(!this.aula||!this.periodo)return;this.ocupado=true;try{const d=await this.api.solicitar<{students:Enrollment[];competencies:Competency[];levels:Nivel[]}>(`primary-levels?classroom_id=${this.aula}&academic_period_id=${this.periodo}`);this.alumnas=d.students;this.competencias=d.competencies;this.filas=d.students.flatMap(e=>d.competencies.map(c=>d.levels.find(n=>n.enrollment_id===e.id&&n.competency_id===c.id)??{enrollment_id:e.id,competency_id:c.id,level:null,conclusion:null}));}catch(e){this.mensaje=String(e);}finally{this.ocupado=false;this.cdr.markForCheck();}}
 async guardar(){this.ocupado=true;try{await this.api.solicitar('primary-levels','PUT',{classroom_id:this.aula,academic_period_id:this.periodo,records:this.filas});this.mensaje='Niveles y conclusiones guardados.';}catch(e){this.mensaje=String(e);}finally{this.ocupado=false;this.cdr.markForCheck();}}
}
