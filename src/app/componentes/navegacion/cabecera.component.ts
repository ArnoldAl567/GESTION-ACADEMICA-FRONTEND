import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-cabecera',
  templateUrl: './cabecera.component.html',
  styles: ':host { display: contents; }',
})
export class CabeceraComponent {
  @Input() titulo = '';
  @Input() anio = 0;
  @Input() noLeidos = 0;
  @Input() usuario = '';
  @Input() rol = '';
  @Input() temaOscuro = false;

  @Output() abrirMenu = new EventEmitter<void>();
  @Output() abrirComunicados = new EventEmitter<void>();
  @Output() abrirConfiguracion = new EventEmitter<void>();
  @Output() alternarTema = new EventEmitter<void>();

  iniciales(nombre: string): string {
    return nombre.split(' ').filter(Boolean).slice(0, 2).map(parte => parte[0]).join('');
  }
}
