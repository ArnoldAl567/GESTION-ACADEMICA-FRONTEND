import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideZonelessChangeDetection(), provideRouter(routes)]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the session startup', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Institución Educativa N° 80404');
    expect(compiled.textContent).toContain('Comprobando tu sesión');
  });

  it('should render the login when there is no active session', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    app.restoring = false;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Ingresar al sistema');
    expect(compiled.textContent).toContain('Tu perfil y permisos se identificarán automáticamente');
    expect(compiled.textContent).not.toContain('Perfil de acceso');
  });
});
