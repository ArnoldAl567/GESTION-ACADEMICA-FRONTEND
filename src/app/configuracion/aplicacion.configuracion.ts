import { ModuloId, Rol } from '../modelos/academicos.modelos';

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'] as const;
export const COLORES_GRAFICOS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'] as const;
export const ROLES: Rol[] = ['admin', 'docente', 'padre'];

export const INFORMACION_ROLES: Record<string, { label: string; description: string; icon: string; short: string }> = {
  admin: { label: 'Administrador', description: 'Director / Secretaría', icon: 'admin_panel_settings', short: 'Director' },
  docente: { label: 'Docente', description: 'Profesor / Tutor', icon: 'school', short: 'Docente' },
  padre: { label: 'Padre / Apoderado', description: 'Familia / Tutor legal', icon: 'family_restroom', short: 'Apoderado' },
};

export interface ElementoNavegacion {
  id: ModuloId;
  label: string;
  icon: string;
}

export interface GrupoNavegacion {
  id: string;
  label: string;
  icon: string;
  secciones: { label?: string; elementos: ElementoNavegacion[] }[];
}

export const INICIO_NAVEGACION: ElementoNavegacion = { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' };
export const INICIO_FAMILIA: ElementoNavegacion = { id: 'dashboard', label: 'Inicio', icon: 'home' };

// La familia consulta información propia; no navega por los mantenedores institucionales.
export const GRUPOS_NAVEGACION_FAMILIA: GrupoNavegacion[] = [
  { id: 'familia', label: 'Mis hijas', icon: 'family_restroom', secciones: [{ elementos: [
    { id: 'students', label: 'Mis hijas', icon: 'face_3' },
    { id: 'enrollment', label: 'Estado de matrícula', icon: 'assignment_turned_in' },
  ] }] },
  { id: 'seguimiento-familiar', label: 'Vida escolar', icon: 'school', secciones: [{ elementos: [
    { id: 'attendance', label: 'Asistencia', icon: 'fact_check' },
    { id: 'schedule', label: 'Horario', icon: 'schedule' },
    { id: 'grades', label: 'Notas por periodo', icon: 'grading' },
    { id: 'tracking', label: 'Notas y libreta', icon: 'monitoring' },
  ] }] },
  { id: 'comunidad-familiar', label: 'Comunidad', icon: 'forum', secciones: [{ elementos: [
    { id: 'events', label: 'Calendario escolar', icon: 'event' },
    { id: 'communications', label: 'Comunicados', icon: 'chat_bubble_outline' },
  ] }] },
];

export const GRUPOS_NAVEGACION: GrupoNavegacion[] = [
  {
    id: 'gestion', label: 'Gestión escolar', icon: 'school', secciones: [{ elementos: [
      { id: 'enrollment', label: 'Matrículas', icon: 'assignment' },
      { id: 'attendance', label: 'Asistencia', icon: 'fact_check' },
      { id: 'schedule', label: 'Horarios', icon: 'schedule' },
      { id: 'teacherAssignments', label: 'Asignación docente', icon: 'co_present' },
      { id: 'events', label: 'Calendario y eventos', icon: 'event' },
    ] }],
  },
  {
    id: 'evaluacion', label: 'Evaluación y seguimiento', icon: 'workspace_premium', secciones: [{ elementos: [
      { id: 'evaluations', label: 'Evaluaciones', icon: 'quiz' },
      { id: 'grades', label: 'Notas por periodo', icon: 'grading' },
      { id: 'tracking', label: 'Libreta y seguimiento', icon: 'monitoring' },
    ] }],
  },
  {
    id: 'mantenedores', label: 'Mantenedores', icon: 'category', secciones: [
      { label: 'Personas', elementos: [
        { id: 'students', label: 'Alumnas', icon: 'group' },
        { id: 'guardians', label: 'Apoderados', icon: 'family_restroom' },
        { id: 'teachers', label: 'Docentes', icon: 'person_check' },
        { id: 'personnel', label: 'Personal administrativo', icon: 'badge' },
      ] },
      { label: 'Estructura académica', elementos: [
        { id: 'academicCalendar', label: 'Años y periodos', icon: 'calendar_month' },
        { id: 'classrooms', label: 'Grados y secciones', icon: 'meeting_room' },
        { id: 'courses', label: 'Cursos y competencias', icon: 'menu_book' },
      ] },
    ],
  },
  {
    id: 'comunicacion', label: 'Comunicación y análisis', icon: 'forum', secciones: [{ elementos: [
      { id: 'communications', label: 'Comunicados', icon: 'chat_bubble_outline' },
      { id: 'reports', label: 'Reportes', icon: 'bar_chart' },
    ] }],
  },
  {
    id: 'administracion', label: 'Administración', icon: 'admin_panel_settings', secciones: [{ elementos: [
      { id: 'roles', label: 'Usuarios y roles', icon: 'manage_accounts' },
    ] }],
  },
];

// La lista plana sigue sirviendo para títulos y rutas; el menú usa los grupos anteriores.
export const ELEMENTOS_NAVEGACION: ElementoNavegacion[] = [
  INICIO_NAVEGACION,
  ...GRUPOS_NAVEGACION.flatMap(grupo => grupo.secciones.flatMap(seccion => seccion.elementos)),
];

export const RUTAS_MODULOS: Record<ModuloId, string> = {
  dashboard: 'dashboard',
  students: 'alumnos',
  guardians: 'apoderados',
  roles: 'roles',
  teachers: 'docentes',
  personnel: 'personal-administrativo',
  enrollment: 'matriculas',
  classrooms: 'grados-secciones',
  academicCalendar: 'anos-periodos',
  attendance: 'asistencia',
  courses: 'cursos',
  teacherAssignments: 'asignacion-docente',
  schedule: 'horarios',
  events: 'calendario-eventos',
  grades: 'calificaciones',
  evaluations: 'evaluaciones',
  tracking: 'libreta-seguimiento',
  communications: 'comunicados',
  reports: 'reportes',
};

export const TIPOS_REPORTE = [
  { id: 'academic', label: 'Rendimiento académico', description: 'Calificaciones por estudiante y curso', icon: 'trending_up' },
  { id: 'attendance', label: 'Asistencia escolar', description: 'Presencias, faltas y tardanzas', icon: 'groups' },
  { id: 'students', label: 'Padrón de alumnas', description: 'Alumnas y apoderados', icon: 'badge' },
  { id: 'enrollment', label: 'Matrículas', description: 'Estado de las matrículas por año', icon: 'assignment' },
  { id: 'teachers', label: 'Carga docente', description: 'Cursos y horas por docente', icon: 'school' },
] as const;
