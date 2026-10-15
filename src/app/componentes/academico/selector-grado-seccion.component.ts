import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Classroom } from '../../modelos/academicos.modelos';

@Component({
  selector: 'app-selector-grado-seccion',
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-grado-seccion.component.html'
})
export class SelectorGradoSeccionComponent implements OnChanges {
  @Input() aulas: Classroom[] = [];
  @Input() aulaId: number | null = null;
  @Input() deshabilitado = false;
  @Input() permitirTodas = false;
  @Input() permitirTodasLasSecciones = false;
  @Input() grado = 0;
  @Output() aulaIdChange = new EventEmitter<number | null>();
  @Output() gradoChange = new EventEmitter<number>();
  @Output() cambio = new EventEmitter<number | null>();

  get grados(): number[] {
    return [...new Set(this.aulas.map(aula => aula.grade))].sort((a, b) => a - b);
  }

  get secciones(): Classroom[] {
    return this.aulas
      .filter(aula => aula.grade === Number(this.grado))
      .sort((a, b) => a.section.localeCompare(b.section));
  }

  ngOnChanges(): void {
    const aula = this.aulas.find(item => item.id === Number(this.aulaId));
    if (aula) {
      this.grado = aula.grade;
      return;
    }

    if (this.permitirTodas && this.aulaId == null && (this.grado === 0 || !this.grados.includes(this.grado))) {
      this.grado = 0;
      return;
    }

    if (!this.grados.includes(this.grado)) {
      this.grado = this.grados[0] ?? 0;
    }
  }

  cambiarGrado(grado: number): void {
    this.grado = Number(grado);
    this.gradoChange.emit(this.grado);
    const aulaId = this.grado === 0 || this.permitirTodasLasSecciones
      ? null
      : (this.secciones[0]?.id ?? null);
    this.emitir(aulaId);
  }

  cambiarSeccion(aulaId: number | null): void {
    this.emitir(aulaId == null ? null : Number(aulaId));
  }

  private emitir(aulaId: number | null): void {
    this.aulaIdChange.emit(aulaId);
    this.cambio.emit(aulaId);
  }
}
