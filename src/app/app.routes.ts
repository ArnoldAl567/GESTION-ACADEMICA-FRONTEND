import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-module-route',
  template: '',
})
export class ModuleRoute {}

export const routes: Routes = [
  { path: 'planificacion-tareas', component: ModuleRoute, title: 'Planificación y tareas | Institución Educativa N° 80404' },
  { path: 'conducta-incidencias', component: ModuleRoute, title: 'Conducta e incidencias | Institución Educativa N° 80404' },
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: ModuleRoute, title: 'Dashboard | Institución Educativa N° 80404' },
  { path: 'alumnos', component: ModuleRoute, title: 'Alumnas | Institución Educativa N° 80404' },
  { path: 'apoderados', component: ModuleRoute, title: 'Apoderados | Institución Educativa N° 80404' },
  { path: 'roles', component: ModuleRoute, title: 'Roles | Institución Educativa N° 80404' },
  { path: 'docentes', component: ModuleRoute, title: 'Docentes | Institución Educativa N° 80404' },
  { path: 'personal-administrativo', component: ModuleRoute, title: 'Personal administrativo | Institución Educativa N° 80404' },
  { path: 'matriculas', component: ModuleRoute, title: 'Matrículas | Institución Educativa N° 80404' },
  { path: 'grados-secciones', component: ModuleRoute, title: 'Grados y secciones | Institución Educativa N° 80404' },
  { path: 'anos-periodos', component: ModuleRoute, title: 'Años y periodos | Institución Educativa N° 80404' },
  { path: 'asistencia', component: ModuleRoute, title: 'Asistencia | Institución Educativa N° 80404' },
  { path: 'cursos', component: ModuleRoute, title: 'Cursos | Institución Educativa N° 80404' },
  { path: 'asignacion-docente', component: ModuleRoute, title: 'Asignación docente | Institución Educativa N° 80404' },
  { path: 'horarios', component: ModuleRoute, title: 'Horarios | Institución Educativa N° 80404' },
  { path: 'calendario-eventos', component: ModuleRoute, title: 'Calendario y eventos | Institución Educativa N° 80404' },
  { path: 'calificaciones', component: ModuleRoute, title: 'Calificaciones | Institución Educativa N° 80404' },
  { path: 'evaluaciones', component: ModuleRoute, title: 'Evaluaciones | Institución Educativa N° 80404' },
  { path: 'libreta-seguimiento', component: ModuleRoute, title: 'Libreta y seguimiento | Institución Educativa N° 80404' },
  { path: 'comunicados', component: ModuleRoute, title: 'Comunicados | Institución Educativa N° 80404' },
  { path: 'reportes', component: ModuleRoute, title: 'Reportes | Institución Educativa N° 80404' },
  { path: '**', redirectTo: 'dashboard' },
];
