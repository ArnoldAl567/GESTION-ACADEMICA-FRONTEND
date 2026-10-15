export type Rol = string;
export type EstadoAsistencia = 'P' | 'F' | 'T' | 'J';
export type ValorFormulario = string | number | boolean | null;
export type ModuloId = 'dashboard' | 'students' | 'guardians' | 'roles' | 'teachers' | 'personnel' | 'enrollment' | 'classrooms' | 'academicCalendar' | 'attendance' | 'courses' | 'teacherAssignments' | 'schedule' | 'events' | 'grades' | 'evaluations' | 'tracking' | 'communications' | 'reports';
export type PermisosModulo = Record<ModuloId, string[]>;
export type Recurso = 'students' | 'guardians' | 'roles' | 'teachers' | 'courses' | 'enrollments' | 'schedules' | 'classrooms' | 'academic-years' | 'academic-periods' | 'communications' | 'users' | 'administrative-staff' | 'competencies' | 'teacher-assignments' | 'academic-events' | 'evaluations' | 'student-documents' | 'student-observations';

export interface CampoFormulario {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: { value: ValorFormulario; label: string }[];
  min?: number;
  max?: number;
}

export interface RolSistema { id: number; code: string; name: string; description: string; scope: 'admin' | 'docente' | 'padre'; icon: string; active: boolean; system: boolean; users_count?: number; }
export interface Usuario { id: number; name: string; email: string; role: Rol; active: boolean; role_record?: RolSistema; }
export interface Aula { id: number; year: number; grade: number; section: string; capacity: number; enrollments_count?: number; courses_count?: number; active_assignment?: AsignacionDocente | null; }
export interface Apoderado { id: number; name: string; dni: string | null; phone: string; email: string | null; address: string | null; user_id: number | null; status: string; students_count?: number; user?: Usuario; }
export interface Estudiante { id: number; name: string; sex?: 'F' | null; dni: string; guardian: string; guardian_id: number | null; guardian_user_id: number | null; guardian_record?: Apoderado; phone: string; status: string; color: string; birth_date?: string; enrollments?: Matricula[]; documents?: DocumentoEstudiante[]; }
export interface Docente { id: number; name: string; dni: string; email: string; phone: string; status: string; color: string; user_id: number | null; courses?: Curso[]; assignments?: AsignacionDocente[]; }
export interface Curso { id: number; name: string; category: string; description: string; teachers: Docente[]; hours: number; color: string; soft: string; classrooms: Aula[]; }
export interface Matricula { id: number; student_id: number; classroom_id: number; year: number; enrolled_at: string; status: string; student: Estudiante; classroom: Aula; attendances?: Asistencia[]; grades?: Calificacion[]; }
export interface Asistencia { enrollment_id: number; date: string; status: EstadoAsistencia; notes?: string; }
export interface Calificacion { enrollment_id: number; course_id: number; period: number; score: number; }
export interface Horario { id: number; classroom_id: number; course_id: number; day: number; starts_at: string; ends_at: string; course: Curso; teacher: Docente; }
export interface Comunicado { id: number; type: string; subject: string; body: string; audience: string; classroom_id: number | null; draft: boolean; published_at: string | null; author_id: number; author: Usuario; readers: (Usuario & { pivot: { read_at: string | null; archived: boolean } })[]; }
export interface Resumen { students: number; teachers: number; enrollments: number; pending: number; cancelled: number; attendance: number; average: number; unread: number; distribution: {grade: number; total: number}[]; performance: {grade: number; average: number}[]; weekly: {date: string; present: number; absent: number; total: number}[]; trend: {month: string; total: number}[]; alerts: {student: string; average: number | null; attendance: number | null; classroom: string}[]; activity: {description: string; date: string}[]; }
export interface ReglaLogro { level:'AD'|'A'|'B'|'C'; min:number; label:string; conclusion:string; }
export interface ConfiguracionInstitucion { name:string; year:number; period:number; achievement_rules:ReglaLogro[]; director_name:string|null; director_title:string; tutor_signature_label:string; report_card_footer:string|null; }
export interface AnioAcademico { id: number; year: number; starts_on: string; ends_on: string; period_type: 'Bimestral' | 'Trimestral'; status: string; periods_count?: number; }
export interface PeriodoAcademico { id: number; academic_year_id: number; number: number; name: string; starts_on: string; ends_on: string; status: string; academic_year?: AnioAcademico; }
export interface PersonalAdministrativo { id:number; user_id:number|null; name:string; dni:string; email:string; phone:string|null; position:string; status:string; user?:Usuario; }
export interface Competencia { id:number; course_id:number; grade:number|null; name:string; capacity:string; performance:string; evaluation_criterion:string; status:string; course:Curso; }
export interface AsignacionDocente { id:number; teacher_id:number; course_id:number; classroom_id:number; academic_period_id:number; weekly_hours:number; status:string; teacher:Docente; course?:Curso; classroom:Aula; academic_period?:PeriodoAcademico; }
export interface EventoAcademico { id:number; academic_year_id:number; classroom_id:number|null; title:string; type:string; starts_at:string; ends_at:string|null; description:string|null; status:string; academic_year:AnioAcademico; classroom?:Aula; }
export interface NotaEvaluacion { id:number; evaluation_id:number; enrollment_id:number; score:number|null; achievement_level:string|null; observation:string|null; enrollment?:Matricula; evaluation?:Evaluacion; }
export interface Evaluacion { id:number; academic_period_id:number; classroom_id:number; course_id:number; competency_id:number; title:string; type:string; evaluation_date:string; max_score:number; weight:number; status:string; academic_period:PeriodoAcademico; classroom:Aula; course:Curso; competency?:Competencia; scores:NotaEvaluacion[]; }
export interface DocumentoEstudiante { id:number; student_id:number; type:string; document_number:string|null; issued_on:string|null; expires_on:string|null; status:string; notes:string|null; student?:Estudiante; }
export interface ObservacionEstudiante { id:number; enrollment_id:number; academic_period_id:number; type:string; observation:string; observed_on:string; academic_period?:PeriodoAcademico; }
export interface PromedioCurso { course_id:number; course:string; average:number|null; achievement_level:string|null; achievement_label:string|null; weight_total:number; weight_evaluated:number; evaluations_count:number; }
export interface PromedioCompetencia { competency_id:number; competency:string; course:string; average:number|null; achievement_level:string|null; achievement_label:string|null; }
export interface ResumenAsistencia { percentage:number|null; present:number; absent:number; late:number; justified:number; total:number; }
export interface LibretaAcademica { enrollment_id:number; student:Estudiante; classroom:Aula; academic_period:PeriodoAcademico; period_closed:boolean; average:number|null; achievement_level:string|null; achievement_label:string|null; descriptive_conclusion:string; conduct:string; attendance:number|null; attendance_detail:ResumenAsistencia; course_averages:PromedioCurso[]; competency_averages:PromedioCompetencia[]; grades:Calificacion[]; evaluation_scores:NotaEvaluacion[]; observations:ObservacionEstudiante[]; }
export interface DatosIniciales { user: Usuario; permissions: PermisosModulo; settings: ConfiguracionInstitucion; year: number; years: number[]; periods: PeriodoAcademico[]; classrooms: Aula[]; teachers: Docente[]; courses: Curso[]; dashboard: Resumen; }
export interface Pagina<T> { data: T[]; total: number; current_page: number; last_page: number; from: number | null; to: number | null; }
export interface Reporte { columns: string[]; rows: (string | number | null)[][]; summary: Resumen; type: string; year: number; period: number; }

// Alias temporales para mantener legible la migración desde los nombres originales de la API.
export type Role = Rol;
export type AttendanceState = EstadoAsistencia;
export type FormValue = ValorFormulario;
export type ModuleId = ModuloId;
export type Resource = Recurso;
export type Field = CampoFormulario;
export type User = Usuario;
export type SystemRole = RolSistema;
export type Classroom = Aula;
export type Guardian = Apoderado;
export type Student = Estudiante;
export type Teacher = Docente;
export type Course = Curso;
export type Enrollment = Matricula;
export type Attendance = Asistencia;
export type Grade = Calificacion;
export type Schedule = Horario;
export type Communication = Comunicado;
export type Summary = Resumen;
export type Settings = ConfiguracionInstitucion;
export type AcademicYear = AnioAcademico;
export type AcademicPeriod = PeriodoAcademico;
export type Bootstrap = DatosIniciales;
export type Page<T> = Pagina<T>;
export type Report = Reporte;
export type AdministrativeStaff = PersonalAdministrativo;
export type Competency = Competencia;
export type TeacherAssignment = AsignacionDocente;
export type AcademicEvent = EventoAcademico;
export type Evaluation = Evaluacion;
export type EvaluationScore = NotaEvaluacion;
export type StudentDocument = DocumentoEstudiante;
export type StudentObservation = ObservacionEstudiante;
export type ReportCard = LibretaAcademica;
