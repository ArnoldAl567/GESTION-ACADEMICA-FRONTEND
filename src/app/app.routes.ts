import { Component } from '@angular/core';
import { Routes } from '@angular/router';

@Component({
  selector: 'app-module-route',
  template: '',
})
export class ModuleRoute {}

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', component: ModuleRoute, title: 'Dashboard | EduGest Pro' },
  { path: 'alumnos', component: ModuleRoute, title: 'Alumnos | EduGest Pro' },
  { path: 'docentes', component: ModuleRoute, title: 'Docentes | EduGest Pro' },
  { path: 'matriculas', component: ModuleRoute, title: 'Matrículas | EduGest Pro' },
  { path: 'grados-secciones', component: ModuleRoute, title: 'Grados y secciones | EduGest Pro' },
  { path: 'anos-periodos', component: ModuleRoute, title: 'Años y periodos | EduGest Pro' },
  { path: 'asistencia', component: ModuleRoute, title: 'Asistencia | EduGest Pro' },
  { path: 'cursos', component: ModuleRoute, title: 'Cursos | EduGest Pro' },
  { path: 'horarios', component: ModuleRoute, title: 'Horarios | EduGest Pro' },
  { path: 'calificaciones', component: ModuleRoute, title: 'Calificaciones | EduGest Pro' },
  { path: 'comunicados', component: ModuleRoute, title: 'Comunicados | EduGest Pro' },
  { path: 'reportes', component: ModuleRoute, title: 'Reportes | EduGest Pro' },
  { path: '**', redirectTo: 'dashboard' },
];
