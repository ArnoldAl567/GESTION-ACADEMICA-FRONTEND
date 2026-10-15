import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ELEMENTOS_NAVEGACION, GRUPOS_NAVEGACION, GRUPOS_NAVEGACION_FAMILIA, INICIO_FAMILIA, INICIO_NAVEGACION } from '../../configuracion/aplicacion.configuracion';
import { BarraLateralComponent } from './barra-lateral.component';

describe('BarraLateralComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraLateralComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
  });

  function crearBarra(moduloActivo: typeof INICIO_NAVEGACION.id = 'dashboard') {
    const fixture = TestBed.createComponent(BarraLateralComponent);
    fixture.componentRef.setInput('inicio', INICIO_NAVEGACION);
    fixture.componentRef.setInput('grupos', GRUPOS_NAVEGACION);
    fixture.componentRef.setInput('moduloActivo', moduloActivo);
    fixture.detectChanges();
    return fixture;
  }

  it('organiza todos los módulos una sola vez', () => {
    const ids = [INICIO_NAVEGACION.id, ...GRUPOS_NAVEGACION.flatMap(grupo =>
      grupo.secciones.flatMap(seccion => seccion.elementos.map(elemento => elemento.id))
    )];

    expect(ids.length).toBe(ELEMENTOS_NAVEGACION.length);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('abre el grupo del módulo activo, también al cambiar de ruta', () => {
    const fixture = crearBarra('attendance');
    expect(fixture.componentInstance.grupoAbierto).toBe('gestion');
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toContain('Asistencia');

    fixture.componentRef.setInput('moduloActivo', 'students');
    fixture.detectChanges();
    expect(fixture.componentInstance.grupoAbierto).toBe('mantenedores');
    expect(fixture.nativeElement.querySelector('[aria-current="page"]')?.textContent).toContain('Alumnas');
  });

  it('mantiene abierto solo un grupo y permite abrirlo desde el menú contraído', () => {
    const fixture = crearBarra();
    const component = fixture.componentInstance;
    component.alternarGrupo('gestion');
    expect(component.grupoAbierto).toBe('gestion');
    component.alternarGrupo('evaluacion');
    expect(component.grupoAbierto).toBe('evaluacion');

    fixture.componentRef.setInput('contraida', true);
    fixture.detectChanges();
    spyOn(component.alternar, 'emit');
    component.alternarGrupo('administracion');
    expect(component.grupoAbierto).toBe('administracion');
    expect(component.alternar.emit).toHaveBeenCalled();

    fixture.componentRef.setInput('contraida', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#grupo-administracion')?.textContent).toContain('Configuración');
  });

  it('conserva la navegación y la apertura de configuración', () => {
    const fixture = crearBarra();
    const component = fixture.componentInstance;
    spyOn(component.cambiarModulo, 'emit');
    spyOn(component.abrirConfiguracion, 'emit');

    const barra = fixture.nativeElement as HTMLElement;
    barra.querySelector<HTMLButtonElement>('[aria-controls="grupo-gestion"]')?.click();
    fixture.detectChanges();
    const matriculas = [...barra.querySelectorAll<HTMLButtonElement>('#grupo-gestion button')]
      .find(boton => boton.textContent?.includes('Matrículas'));
    matriculas?.click();
    expect(component.cambiarModulo.emit).toHaveBeenCalledWith('enrollment');

    barra.querySelector<HTMLButtonElement>('[aria-controls="grupo-administracion"]')?.click();
    fixture.detectChanges();
    const configuracion = [...barra.querySelectorAll<HTMLButtonElement>('#grupo-administracion button')]
      .find(boton => boton.textContent?.includes('Configuración'));
    configuracion?.click();
    expect(component.abrirConfiguracion.emit).toHaveBeenCalled();
  });

  it('muestra a la familia solo consultas propias y acceso a su perfil', () => {
    const fixture = crearBarra('students');
    fixture.componentRef.setInput('inicio', INICIO_FAMILIA);
    fixture.componentRef.setInput('grupos', GRUPOS_NAVEGACION_FAMILIA);
    fixture.componentRef.setInput('mostrarMiPerfil', true);
    fixture.detectChanges();

    const ids = GRUPOS_NAVEGACION_FAMILIA.flatMap(grupo => grupo.secciones.flatMap(seccion => seccion.elementos.map(item => item.id)));
    expect(ids).toContain('students');
    expect(ids).toContain('tracking');
    expect(ids).not.toContain('guardians');
    expect(ids).not.toContain('courses');

    const perfil = [...(fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.sidebar-footer button')]
      .find(boton => boton.textContent?.includes('Mi perfil'));
    spyOn(fixture.componentInstance.abrirPerfil, 'emit');
    perfil?.click();
    expect(fixture.componentInstance.abrirPerfil.emit).toHaveBeenCalled();
  });
});
