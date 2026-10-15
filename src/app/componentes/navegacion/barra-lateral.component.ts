import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { ElementoNavegacion, GrupoNavegacion, INICIO_NAVEGACION } from '../../configuracion/aplicacion.configuracion';
import { ModuloId } from '../../modelos/academicos.modelos';

@Component({
  selector: 'app-barra-lateral',
  templateUrl: './barra-lateral.component.html',
  styles: ':host { display: contents; }',
})
export class BarraLateralComponent implements OnChanges {
  @Input() abiertaEnMovil = false;
  @Input() contraida = false;
  @Input() ocupada = false;
  @Input() institucion = '';
  @Input() usuario = '';
  @Input() rol = '';
  @Input() moduloActivo: ModuloId = 'dashboard';
  @Input() pendientes = 0;
  @Input() noLeidos = 0;
  @Input() inicio: ElementoNavegacion = INICIO_NAVEGACION;
  @Input() grupos: GrupoNavegacion[] = [];
  @Input() mostrarMiPerfil = false;

  @Output() cambiarModulo = new EventEmitter<ModuloId>();
  @Output() alternar = new EventEmitter<void>();
  @Output() abrirConfiguracion = new EventEmitter<void>();
  @Output() abrirPerfil = new EventEmitter<void>();
  @Output() cerrarSesion = new EventEmitter<void>();

  grupoAbierto: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moduloActivo'] || changes['grupos']) {
      this.grupoAbierto = this.grupos.find(grupo => this.grupoContieneModulo(grupo, this.moduloActivo))?.id ?? null;
    }
  }

  alternarGrupo(id: string): void {
    this.grupoAbierto = this.grupoAbierto === id && !this.contraida ? null : id;
    if (this.contraida) this.alternar.emit();
  }

  grupoContieneModulo(grupo: GrupoNavegacion, modulo: ModuloId): boolean {
    return grupo.secciones.some(seccion => seccion.elementos.some(elemento => elemento.id === modulo));
  }

  iniciales(nombre: string): string {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('');
  }
}
