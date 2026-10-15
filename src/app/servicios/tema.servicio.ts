import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

type Tema = 'claro' | 'oscuro';

@Injectable({ providedIn: 'root' })
export class TemaServicio {
  private readonly document = inject(DOCUMENT);
  private readonly temaActual = signal<Tema>('claro');

  readonly esOscuro = () => this.temaActual() === 'oscuro';

  inicializar(): void {
    const temaGuardado = localStorage.getItem('ie-80404-tema') as Tema | null;
    const preferenciaSistema = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
    this.aplicar(temaGuardado === 'claro' || temaGuardado === 'oscuro' ? temaGuardado : preferenciaSistema);
  }

  alternar(): void {
    this.aplicar(this.esOscuro() ? 'claro' : 'oscuro');
  }

  private aplicar(tema: Tema): void {
    this.temaActual.set(tema);
    this.document.documentElement.dataset['theme'] = tema === 'oscuro' ? 'dark' : 'light';
    this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', tema === 'oscuro' ? '#0b1120' : '#0f172a');
    localStorage.setItem('ie-80404-tema', tema);
  }
}
