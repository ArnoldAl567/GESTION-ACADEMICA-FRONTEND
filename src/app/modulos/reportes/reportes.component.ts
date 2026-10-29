import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectorGradoSeccionComponent } from '../../componentes/academico/selector-grado-seccion.component';
import { TIPOS_REPORTE } from '../../configuracion/aplicacion.configuracion';
import { AcademicPeriod, Classroom, Report } from '../../modelos/academicos.modelos';
import { FiltrosReporte, ReportesServicio } from '../../servicios/dominios/reportes.servicio';

@Component({
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule, SelectorGradoSeccionComponent],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.css',
})
export class ReportesComponent implements OnChanges {
  @Input() anio = 2026;
  @Input() periodoInicial = 1;
  @Input() periodos: AcademicPeriod[] = [];
  @Input() aulas: Classroom[] = [];
  @Output() mensaje = new EventEmitter<string>();
  @Output() error = new EventEmitter<string>();

  private readonly servicio = inject(ReportesServicio);
  private readonly cdr = inject(ChangeDetectorRef);
  private peticionActual = 0;

  readonly tipos = TIPOS_REPORTE;
  tipo = 'academic';
  periodo = 1;
  grado = 0;
  aulaId: number | null = null;
  busqueda = '';
  busquedaAplicada = '';
  filtrosVigentes: FiltrosReporte | null = null;
  reporte: Report | null = null;
  cargando = false;
  exportando = false;
  fallo = '';

  ngOnChanges(): void {
    this.periodo = this.periodoInicial;
    this.grado = 0;
    this.aulaId = null;
    void this.cargar();
  }

  get aulasDelAnio(): Classroom[] {
    return this.aulas.filter(aula => aula.year === this.anio);
  }

  get etiquetaTipo(): string {
    return this.tipos.find(tipo => tipo.id === this.tipo)?.label ?? 'Reporte';
  }

  get etiquetaAula(): string {
    const aulaId = this.filtrosVigentes?.classroom_id ?? null;
    const grado = this.filtrosVigentes?.grade ?? 0;
    const aula = this.aulasDelAnio.find(item => item.id === aulaId);
    return aula ? `${aula.grade}° — Sec. ${aula.section}` : grado ? `${grado}° grado · todas las secciones` : 'Todos los grados';
  }

  get etiquetaPeriodo(): string {
    const periodo = this.filtrosVigentes?.period ?? this.periodo;
    return this.periodos.find(item => item.number === periodo)?.name ?? `Periodo ${periodo}`;
  }

  get filtrosActivos(): boolean {
    return (this.filtrosVigentes?.grade ?? 0) > 0 || this.filtrosVigentes?.classroom_id != null || (this.filtrosVigentes?.q ?? '') !== '';
  }

  get filtrosSinAplicar(): boolean {
    return !!this.filtrosVigentes && JSON.stringify({ ...this.filtros(), q: this.busqueda.trim() }) !== JSON.stringify(this.filtrosVigentes);
  }

  get indicadores(): { etiqueta: string; valor: string; detalle: string }[] {
    const filas = this.reporte?.rows ?? [];
    const total = filas.length;
    if (this.tipo === 'academic') {
      const notas = filas.filter(fila => fila[5] !== null && fila[5] !== '').map(fila => Number(fila[5])).filter(nota => Number.isFinite(nota));
      const promedio = notas.length ? (notas.reduce((suma, nota) => suma + nota, 0) / notas.length).toFixed(2) : '—';
      return [{ etiqueta: 'Calificaciones', valor: String(total), detalle: 'Registros del periodo' }, { etiqueta: 'Promedio', valor: promedio, detalle: 'Sobre 20 puntos' }, { etiqueta: 'Alumnas evaluadas', valor: String(new Set(filas.map(fila => fila[0])).size), detalle: 'Con al menos una nota' }];
    }
    if (this.tipo === 'attendance') {
      const presentes = filas.filter(fila => fila[4] === 'Presente' || fila[4] === 'Tardanza').length;
      return [{ etiqueta: 'Registros', valor: String(total), detalle: 'En el periodo' }, { etiqueta: 'Presencias', valor: String(presentes), detalle: 'Incluye tardanzas' }, { etiqueta: 'Porcentaje', valor: total ? `${Math.round(presentes * 100 / total)}%` : '—', detalle: 'Sobre registros realizados' }];
    }
    if (this.tipo === 'students') {
      return [{ etiqueta: 'Alumnas', valor: String(total), detalle: 'En el padrón' }, { etiqueta: 'Matriculadas', valor: String(filas.filter(fila => fila[5] !== 'Sin matrícula').length), detalle: `Año ${this.anio}` }, { etiqueta: 'Sin matrícula', valor: String(filas.filter(fila => fila[5] === 'Sin matrícula').length), detalle: `Año ${this.anio}` }];
    }
    if (this.tipo === 'enrollment') {
      return [{ etiqueta: 'Matrículas', valor: String(total), detalle: `Año ${this.anio}` }, { etiqueta: 'Activas', valor: String(filas.filter(fila => fila[6] === 'Activo').length), detalle: 'Registradas' }, { etiqueta: 'Pendientes', valor: String(filas.filter(fila => fila[6] === 'Pendiente').length), detalle: 'Por confirmar' }];
    }
    return [{ etiqueta: 'Docentes', valor: String(total), detalle: 'En el reporte' }, { etiqueta: 'Con aula', valor: String(filas.filter(fila => fila[2] !== 'Sin aula asignada').length), detalle: `Año ${this.anio}` }, { etiqueta: 'Horas semanales', valor: String(filas.reduce((suma, fila) => suma + Number(fila[4] || 0), 0)), detalle: 'Carga asignada' }];
  }

  seleccionarTipo(tipo: string): void {
    if (this.tipo === tipo) return;
    this.tipo = tipo;
    this.busqueda = '';
    this.busquedaAplicada = '';
    void this.cargar();
  }

  cambiarGrado(grado: number): void {
    this.grado = grado;
  }

  aplicar(): void {
    this.busquedaAplicada = this.busqueda.trim();
    void this.cargar();
  }

  limpiar(): void {
    this.periodo = this.periodoInicial;
    this.grado = 0;
    this.aulaId = null;
    this.busqueda = '';
    this.busquedaAplicada = '';
    void this.cargar();
  }

  private filtros(): FiltrosReporte {
    return { type: this.tipo, year: this.anio, period: this.periodo, grade: this.grado, classroom_id: this.aulaId, q: this.busquedaAplicada };
  }

  async cargar(): Promise<void> {
    const peticion = ++this.peticionActual;
    const filtros = this.filtros();
    this.cargando = true;
    this.fallo = '';
    this.reporte = null;
    this.filtrosVigentes = null;
    try {
      const reporte = await this.servicio.consultar(filtros);
      if (peticion === this.peticionActual) {
        this.reporte = reporte;
        this.filtrosVigentes = filtros;
      }
    } catch (error) {
      if (peticion === this.peticionActual) {
        this.reporte = null;
        this.fallo = error instanceof Error ? error.message : 'No se pudo cargar el reporte.';
        this.error.emit(this.fallo);
      }
    } finally {
      if (peticion === this.peticionActual) this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async exportar(): Promise<void> {
    if (!this.reporte || !this.filtrosVigentes || this.exportando) return;
    this.exportando = true;
    try {
      await this.servicio.descargar(this.filtrosVigentes);
      this.mensaje.emit('Reporte CSV descargado con los filtros aplicados.');
    } catch (error) {
      this.error.emit(error instanceof Error ? error.message : 'No se pudo exportar el reporte.');
    } finally {
      this.exportando = false;
      this.cdr.markForCheck();
    }
  }

  imprimir(): void {
    if (this.reporte) window.print();
  }
}
