import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Report } from '../../modelos/academicos.modelos';
import { ReportesServicio } from '../../servicios/dominios/reportes.servicio';
import { ReportesComponent } from './reportes.component';

describe('ReportesComponent', () => {
  let servicio: jasmine.SpyObj<ReportesServicio>;

  beforeEach(async () => {
    servicio = jasmine.createSpyObj<ReportesServicio>('ReportesServicio', ['consultar', 'descargar']);
    servicio.consultar.and.resolveTo({ columns: ['Alumna', 'DNI', 'Apoderado', 'Teléfono', 'Estado', 'Matrícula'], rows: [['Ana Pérez', '12345678', 'María Pérez', '987654321', 'Activo', 'Activo']] } as Report);
    servicio.descargar.and.resolveTo();
    await TestBed.configureTestingModule({
      imports: [ReportesComponent],
      providers: [provideZonelessChangeDetection(), { provide: ReportesServicio, useValue: servicio }],
    }).compileComponents();
  });

  it('consulta por grado y sección y exporta los filtros realmente mostrados', async () => {
    const fixture = TestBed.createComponent(ReportesComponent);
    fixture.componentRef.setInput('anio', 2026);
    fixture.componentRef.setInput('periodoInicial', 3);
    fixture.componentRef.setInput('aulas', [{ id: 7, year: 2026, grade: 5, section: 'A' }]);
    fixture.detectChanges();
    await fixture.whenStable();

    const component = fixture.componentInstance;
    component.seleccionarTipo('students');
    await fixture.whenStable();
    component.grado = 5;
    component.aulaId = 7;
    component.busqueda = 'Ana';
    component.aplicar();
    await fixture.whenStable();

    expect(servicio.consultar).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'students', year: 2026, grade: 5, classroom_id: 7, q: 'Ana' }));
    component.busqueda = 'Otro nombre';
    expect(component.filtrosSinAplicar).toBeTrue();
    await component.exportar();
    expect(servicio.descargar).toHaveBeenCalledWith(jasmine.objectContaining({ q: 'Ana', classroom_id: 7 }));
  });
});
