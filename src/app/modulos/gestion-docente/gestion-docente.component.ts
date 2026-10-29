import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AcademicPeriod, Classroom, Course, Enrollment } from '../../modelos/academicos.modelos';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { ApiAcademicaServicio } from '../../servicios/api-academica.servicio';

interface RegistroDocente {
  id?: number; classroom_id: number; academic_period_id: number; course_id: number;
  enrollment_id: number; type: string; title: string; description: string; materials: string;
  scheduled_on: string; due_on: string | null; observation: string; observed_on: string;
  action_taken: string; follow_up_on: string | null; status: string;
  enrollment?: Enrollment; course?: Course;
}

@Component({
  selector: 'app-gestion-docente',
  imports: [CommonModule, FormsModule, SelectorGradoSeccionComponent],
  templateUrl: './gestion-docente.component.html',
  styleUrl: './gestion-docente.component.css',
})
export class GestionDocenteComponent implements OnChanges {
  @Input() modo: 'planning' | 'conduct' = 'planning';
  @Input() aulas: Classroom[] = [];
  @Input() periodos: AcademicPeriod[] = [];
  @Input() cursos: Course[] = [];
  @Input() crear = false;
  @Input() editar = false;
  @Input() eliminar = false;
  @Output() mensaje = new EventEmitter<string>();
  private api = inject(ApiAcademicaServicio);
  private cdr = inject(ChangeDetectorRef);
  aulaId = 0;
  periodoId = 0;
  busqueda = '';
  registros: RegistroDocente[] = [];
  alumnas: Enrollment[] = [];
  borrador: RegistroDocente | null = null;
  original = '';
  ocupado = false;
  error = '';
  confirmarCierre = false;
  borrar: RegistroDocente | null = null;
  private solicitud = 0;

  get planificacion(): boolean { return this.modo === 'planning'; }
  get titulo(): string { return this.planificacion ? 'Planificación, tareas y actividades' : 'Conducta, incidencias y seguimiento'; }
  get recurso(): string { return this.planificacion ? 'learning-activities' : 'conduct-records'; }
  get cerrado(): boolean { return this.periodos.find(p => p.id === this.periodoId)?.status === 'Cerrado'; }
  get tipos(): string[] { return this.planificacion ? ['Planificación', 'Tarea', 'Actividad', 'Material'] : ['Conductual', 'Incidencia', 'Falta', 'Reconocimiento', 'Tutoría', 'Académica']; }
  get estados(): string[] { return this.planificacion ? ['Planificada', 'En curso', 'Completada', 'Cancelada'] : ['Registrado', 'En seguimiento', 'Resuelto']; }
  get cursosAula(): Course[] {
    return this.cursos.filter(curso => curso.classrooms.some(aula => aula.id === this.aulaId));
  }

  ngOnChanges(): void {
    this.aulaId = this.aulas[0]?.id ?? 0;
    this.periodoId = this.periodos.find(p => p.status === 'Activo')?.id ?? this.periodos[0]?.id ?? 0;
    void this.cargar();
  }

  async cargar(): Promise<void> {
    const solicitud = ++this.solicitud;
    this.ocupado = true; this.error = '';
    try {
      if (!this.aulaId || !this.periodoId) { this.registros = []; return; }
      const filtros = `classroom_id=${this.aulaId}&academic_period_id=${this.periodoId}&q=${encodeURIComponent(this.busqueda)}`;
      const [registros, alumnas] = await Promise.all([
        this.api.listarTodos<RegistroDocente>(`management/${this.recurso}?${filtros}`),
        this.planificacion ? Promise.resolve([]) : this.api.listarTodos<Enrollment>(`enrollments?classroom_id=${this.aulaId}&year=${this.aulas.find(a => a.id === this.aulaId)?.year}`),
      ]);
      if (solicitud === this.solicitud) { this.registros = registros; this.alumnas = alumnas; }
    } catch (error) { this.error = error instanceof Error ? error.message : 'No se pudo cargar la información.'; }
    finally { if (solicitud === this.solicitud) this.ocupado = false; this.cdr.markForCheck(); }
  }

  abrir(registro?: RegistroDocente): void {
    const periodo = this.periodos.find(p => p.id === this.periodoId);
    this.borrador = registro ? structuredClone(registro) : {
      classroom_id: this.aulaId, academic_period_id: this.periodoId, course_id: this.cursosAula[0]?.id ?? 0,
      enrollment_id: this.alumnas[0]?.id ?? 0, type: this.tipos[0], title: '', description: '', materials: '',
      scheduled_on: periodo?.starts_on?.slice(0, 10) ?? '', due_on: null, observation: '',
      observed_on: periodo?.starts_on?.slice(0, 10) ?? '', action_taken: '', follow_up_on: null, status: this.estados[0],
    };
    this.original = JSON.stringify(this.borrador); this.error = '';
  }

  cerrar(): void {
    if (this.ocupado) return;
    if (JSON.stringify(this.borrador) !== this.original) this.confirmarCierre = true;
    else this.borrador = null;
  }

  async guardar(): Promise<void> {
    if (!this.borrador || this.ocupado) return;
    this.ocupado = true; this.error = '';
    try {
      const registro = this.borrador;
      await this.api.solicitar(`management/${this.recurso}${registro.id ? '/' + registro.id : ''}`, registro.id ? 'PUT' : 'POST', registro);
      this.borrador = null; this.mensaje.emit('Registro guardado.'); await this.cargar();
    } catch (error) { this.error = error instanceof Error ? error.message : 'No se pudo guardar.'; }
    finally { this.ocupado = false; this.cdr.markForCheck(); }
  }

  async eliminarRegistro(): Promise<void> {
    if (!this.borrar || this.ocupado) return;
    this.ocupado = true;
    try {
      await this.api.solicitar(`management/${this.recurso}/${this.borrar.id}`, 'DELETE');
      this.borrar = null; this.mensaje.emit('Registro eliminado.'); await this.cargar();
    } catch (error) { this.error = error instanceof Error ? error.message : 'No se pudo eliminar.'; }
    finally { this.ocupado = false; this.cdr.markForCheck(); }
  }
}
