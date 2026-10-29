import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PanelComponent } from './componentes/panel/panel.component';
import { BarraLateralComponent } from './componentes/navegacion/barra-lateral.component';
import { CabeceraComponent } from './componentes/navegacion/cabecera.component';
import { SelectorGradoSeccionComponent } from './componentes/academico/selector-grado-seccion.component';
import { COLORES_GRAFICOS, DIAS_SEMANA, ELEMENTOS_NAVEGACION, GRUPOS_NAVEGACION, GRUPOS_NAVEGACION_FAMILIA, GrupoNavegacion, INFORMACION_ROLES, INICIO_FAMILIA, INICIO_NAVEGACION, RUTAS_MODULOS } from './configuracion/aplicacion.configuracion';
import { AcademicEvent, AcademicPeriod, AcademicYear, AdministrativeStaff, AttendanceState, Bootstrap, Classroom, Communication, Competency, Course, Enrollment, Evaluation, Field, FormValue, Guardian, ModuleId, Page, PermisosModulo, ReportCard, Resource, Role, Schedule, Settings, Student, StudentDocument, StudentObservation, Summary, SystemRole, Teacher, TeacherAssignment, User } from './modelos/academicos.modelos';
import { ApiAcademicaServicio, ErrorApi } from './servicios/api-academica.servicio';
import { TemaServicio } from './servicios/tema.servicio';
import { EstudiantesServicio } from './servicios/dominios/estudiantes.servicio';
import { MatriculasServicio } from './servicios/dominios/matriculas.servicio';
import { AsistenciaServicio } from './servicios/dominios/asistencia.servicio';
import { EvaluacionesServicio } from './servicios/dominios/evaluaciones.servicio';
import { SeguimientoAcademicoServicio } from './servicios/dominios/seguimiento-academico.servicio';
import { EstudiantesComponent } from './modulos/estudiantes/estudiantes.component';
import { MatriculasComponent } from './modulos/matriculas/matriculas.component';
import { AsistenciaComponent } from './modulos/asistencia/asistencia.component';
import { EvaluacionesComponent } from './modulos/evaluaciones/evaluaciones.component';
import { SeguimientoComponent } from './modulos/seguimiento/seguimiento.component';
import { ReportesComponent } from './modulos/reportes/reportes.component';
import { GestionDocenteComponent } from './modulos/gestion-docente/gestion-docente.component';
import { NivelesPrimariaComponent } from './modulos/evaluaciones/niveles-primaria.component';
import { NotificacionesComponent } from './componentes/interfaz/notificaciones.component';
import { FiltroActivo, FiltrosActivosComponent } from './componentes/interfaz/filtros-activos.component';

@Component({ selector: 'app-root', imports: [CommonModule, FormsModule, RouterOutlet, BarraLateralComponent, CabeceraComponent, PanelComponent, SelectorGradoSeccionComponent, EstudiantesComponent, MatriculasComponent, AsistenciaComponent, EvaluacionesComponent, SeguimientoComponent, ReportesComponent, GestionDocenteComponent, NivelesPrimariaComponent, NotificacionesComponent, FiltrosActivosComponent], templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  private readonly api = inject(ApiAcademicaServicio);
  private readonly tema = inject(TemaServicio);
  private readonly estudiantesServicio = inject(EstudiantesServicio);
  private readonly matriculasServicio = inject(MatriculasServicio);
  private readonly asistenciaServicio = inject(AsistenciaServicio);
  private readonly evaluacionesServicio = inject(EvaluacionesServicio);
  private readonly seguimientoServicio = inject(SeguimientoAcademicoServicio);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private pendingRouteLoad = false;
  authenticated = false;
  restoring = true;
  busy = false;
  error = '';
  notice = '';
  user: User | null = null;
  selectedRole: Role = 'admin';
  loginForm = {email: '', password: '', remember: false};
  showPassword = false;
  activeModule: ModuleId = 'dashboard';
  sidebarCollapsed = false;
  mobileOpen = false;
  profileOpen = false;
  onboardingOpen = false;
  onboardingStep = 0;
  query = '';
  statusFilter = '';
  categoryFilter = '';
  gradeFilter = 0;
  studentGradeFilter = 0;
  studentClassroomFilter: number | null = null;
  enrollmentGradeFilter = 0;
  enrollmentClassroomFilter: number | null = null;
  messageFilter = '';
  showArchived = false;
  page = 1;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  year = 2026;
  period = 3;
  periods: AcademicPeriod[] = [];
  academicYears: AcademicYear[] = [];
  academicPeriods: AcademicPeriod[] = [];
  selectedAcademicYearId = 0;
  settings: Settings = {
    name:'Institución Educativa N° 80404',year:2026,period:3,director_name:null,director_title:'Director(a)',tutor_signature_label:'Docente tutor(a)',report_card_footer:'Documento generado por el Sistema de Gestión Académica.',
    achievement_rules:[
      {level:'AD',min:18,label:'Logro destacado',conclusion:'Supera satisfactoriamente los aprendizajes previstos.'},
      {level:'A',min:14,label:'Logro esperado',conclusion:'Alcanza los aprendizajes previstos para el periodo.'},
      {level:'B',min:11,label:'En proceso',conclusion:'Está próximo a alcanzar los aprendizajes previstos y requiere acompañamiento.'},
      {level:'C',min:0,label:'En inicio',conclusion:'Requiere mayor tiempo y acompañamiento para desarrollar los aprendizajes previstos.'}
    ]
  };
  settingsOpen = false;
  users: User[] = [];
  systemRoles: SystemRole[] = [];
  passwordForm = {current_password: '', password: '', password_confirmation: ''};
  classrooms: Classroom[] = [];
  classroomRows: Classroom[] = [];
  selectedClassroomId = 0;
  selectedCourseId = 0;
  students: Student[] = [];
  guardians: Guardian[] = [];
  guardianContactOpen = false;
  guardianContactDraft = {phone:'',email:'',address:''};
  private guardianContactSnapshot = '';
  teachers: Teacher[] = [];
  administrativeStaff: AdministrativeStaff[] = [];
  courses: Course[] = [];
  competencies: Competency[] = [];
  teacherAssignments: TeacherAssignment[] = [];
  academicEvents: AcademicEvent[] = [];
  evaluations: Evaluation[] = [];
  reportCards: ReportCard[] = [];
  studentDocuments: StudentDocument[] = [];
  selectedEvaluation: Evaluation | null = null;
  evaluationEnrollments: Enrollment[] = [];
  evaluationScores: Record<number, number | null> = {};
  private evaluationSnapshot = '';
  enrollments: Enrollment[] = [];
  schedules: Schedule[] = [];
  messages: Communication[] = [];
  selectedMessage: Communication | null = null;
  selectedStudent: Student | null = null;
  selectedGuardian: Guardian | null = null;
  selectedSystemRole: SystemRole | null = null;
  selectedTeacher: Teacher | null = null;
  selectedCourse: Course | null = null;
  selectedEnrollment: Enrollment | null = null;
  selectedSchedule: Schedule | null = null;
  selectedClassroomDetail: Classroom | null = null;
  selectedAcademicYear: AcademicYear | null = null;
  selectedAcademicPeriod: AcademicPeriod | null = null;
  attendanceRows: Enrollment[] = [];
  gradeRows: Enrollment[] = [];
  attendance: Record<number, AttendanceState | ''> = {};
  scores: Record<number, number | null> = {};
  originalScores: Record<number, number | null> = {};
  date = new Date().toLocaleDateString('en-CA');
  summary: Summary = {students:0,teachers:0,enrollments:0,pending:0,cancelled:0,attendance:0,average:0,unread:0,distribution:[],performance:[],weekly:[],trend:[],alerts:[],activity:[]};
  modal: Resource | null = null;
  editingId: number | null = null;
  draft: Record<string, FormValue> = {};
  private modalSnapshot = '';
  private settingsSnapshot = '';
  confirmDiscard: 'modal' | 'evaluation' | 'settings' | 'guardian' | null = null;
  selectedRoomIds: number[] = [];
  assignmentGrade = 0;
  enrollmentCandidates: Student[] = [];
  confirmDelete: {resource: Resource; id: number; name: string} | null = null;
  readonly days = DIAS_SEMANA;
  readonly colors = COLORES_GRAFICOS;
  readonly attendanceStates: AttendanceState[] = ['P','F','T','J'];
  readonly roleInfo = INFORMACION_ROLES;
  readonly navItems = ELEMENTOS_NAVEGACION;
  get navInicio() { return this.currentAccessScope === 'padre' ? INICIO_FAMILIA : INICIO_NAVEGACION; }
  navGroups: GrupoNavegacion[] = [];
  permissions: Partial<PermisosModulo> = {};
  private readonly modulePaths = RUTAS_MODULOS;
  private readonly resourceModules: Record<Resource, ModuleId> = {
    students:'students',guardians:'guardians',roles:'roles',teachers:'teachers',courses:'courses',
    enrollments:'enrollment',schedules:'schedule',classrooms:'classrooms',
    'academic-years':'academicCalendar','academic-periods':'academicCalendar',
    communications:'communications',users:'roles','administrative-staff':'personnel',
    competencies:'courses','teacher-assignments':'teacherAssignments',
    'academic-events':'events',evaluations:'evaluations','student-documents':'students',
    'student-observations':'tracking',
  };

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => this.activateRoute(event.urlAfterRedirects));
    afterNextRender(() => { this.tema.inicializar(); void this.restore(); });
  }

  get temaOscuro(): boolean { return this.tema.esOscuro(); }
  get admin(): boolean { return this.currentAccessScope === 'admin'; }
  get staff(): boolean { return this.currentAccessScope === 'admin' || this.currentAccessScope === 'docente'; }
  get currentAccessScope(): string { return this.user?.role_record?.scope ?? this.user?.role ?? ''; }
  can(module: ModuleId, action = 'view'): boolean { return this.permissions[module]?.includes(action) ?? false; }
  get currentRoleName(): string { return this.user?.role_record?.name ?? this.roleInfo[this.selectedRole]?.label ?? this.selectedRole; }
  get currentRoleShort(): string { return this.roleInfo[this.selectedRole]?.short ?? this.user?.role_record?.name ?? this.selectedRole; }
  alternarTema(): void { this.tema.alternar(); }
  get currentLabel(): string { return this.activeModule === 'dashboard' ? this.navInicio.label : this.navGroups.flatMap(grupo=>grupo.secciones.flatMap(seccion=>seccion.elementos)).find(item=>item.id===this.activeModule)?.label ?? this.navItems.find(x=>x.id===this.activeModule)?.label ?? ''; }
  get activeFilters(): FiltroActivo[] {const filters:FiltroActivo[]=[];if(this.query)filters.push({etiqueta:'Búsqueda',valor:this.query});if(this.statusFilter)filters.push({etiqueta:'Estado',valor:this.statusFilter});if(this.categoryFilter)filters.push({etiqueta:'Área',valor:this.categoryFilter});if(this.gradeFilter)filters.push({etiqueta:'Grado',valor:this.gradeFilter+'°'});return filters;}
  clearFilters():void {this.query='';this.statusFilter='';this.categoryFilter='';this.gradeFilter=0;this.filter();}
  get classroom(): Classroom | undefined { return this.classrooms.find(x=>x.id===Number(this.selectedClassroomId)); }
  get classroomLabel(): string { return this.classroom ? this.roomLabel(this.classroom) : 'Selecciona grado y sección'; }
  get classroomCourses(): Course[] { return this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.selectedClassroomId))); }
  get availableEvaluationCompetencies(): Competency[] {
    const room=this.classrooms.find(item=>item.id===Number(this.draft['classroom_id']));
    return this.competencies.filter(item=>item.course_id===Number(this.draft['course_id'])&&(item.grade===null||item.grade===room?.grade)&&item.status==='Activo');
  }
  get classroomGrades(): number[] { return [...new Set(this.classrooms.map(r=>r.grade))].sort((a,b)=>a-b); }
  get assignmentClassrooms(): Classroom[] { return this.classrooms.filter(r=>r.grade===Number(this.assignmentGrade)).sort((a,b)=>a.section.localeCompare(b.section)); }
  get draftClassroomId(): number | null { const value=this.draft['classroom_id'];return value==null||value===''?null:Number(value); }
  get courseCategories(): string[] { return [...new Set(this.courses.map(c=>c.category))]; }
  get filteredCourses(): Course[] { return this.courses.filter(c=>(!this.categoryFilter||c.category===this.categoryFilter)&&c.name.toLowerCase().includes(this.query.toLowerCase())); }
  get filteredTeachers(): Teacher[] { return this.teachers.filter(t=>t.name.toLowerCase().includes(this.query.toLowerCase())&&(!this.statusFilter||t.status===this.statusFilter)); }
  get visibleMessages(): Communication[] { return this.messages.filter(m=>(!this.messageFilter||m.type===this.messageFilter)&&!!m.readers[0]?.pivot.archived===this.showArchived); }
  get attendanceCounts(): Record<AttendanceState,number> { const counts={P:0,F:0,T:0,J:0}; Object.values(this.attendance).forEach(s=>{if(s) counts[s]++;}); return counts; }
  get selectedGradeCourse(): Course | undefined { return this.classroomCourses.find(c=>c.id===Number(this.selectedCourseId)); }
  get activePeriodLabel(): string { return this.periods.find(p=>p.number===Number(this.period))?.name??'Periodo '+this.period; }
  get activePeriodId(): number { return this.periods.find(p=>p.number===Number(this.period))?.id??0; }
  get activePeriod(): AcademicPeriod | undefined { return this.periods.find(p=>p.number===Number(this.period)); }
  get periodClosed(): boolean { return this.activePeriod?.status==='Cerrado'; }
  get maxPeriodsForSelectedYear(): number { return this.academicYears.find(year=>year.id===Number(this.selectedAcademicYearId))?.period_type==='Trimestral'?3:4; }
  get selectedPeriodTypeLabel(): string { return this.maxPeriodsForSelectedYear===3?'Trimestre':'Bimestre'; }
  get invalidScores(): boolean { return Object.values(this.scores).some(score=>!this.validScore(score)); }
  get modalHasChanges(): boolean { return !!this.modal && this.modalSnapshot !== this.currentModalState(); }
  get evaluationHasChanges(): boolean { return !!this.selectedEvaluation && this.evaluationSnapshot !== JSON.stringify(this.evaluationScores); }
  get settingsHasChanges(): boolean { return this.settingsOpen && this.settingsSnapshot !== this.currentSettingsState(); }
  get guardianContactHasChanges(): boolean { return this.guardianContactOpen && this.guardianContactSnapshot !== JSON.stringify(this.guardianContactDraft); }
  get gradeDirty(): boolean { return this.gradeRows.some(e=>this.scores[e.id]!==this.originalScores[e.id]); }
  get gradeSummary(): {average:string;approved:number;failed:number;pending:number} {
    const values=this.gradeRows.map(e=>this.scores[e.id]).filter((score):score is number=>score!==null&&Number.isFinite(Number(score))).map(Number);
    return {average:values.length?(values.reduce((sum,score)=>sum+score,0)/values.length).toFixed(1):'—',approved:values.filter(score=>score>=11).length,failed:values.filter(score=>score<11).length,pending:this.gradeRows.length-values.length};
  }
  get classroomOccupancy(): number { return this.classrooms.reduce((total, room)=>total+(room.enrollments_count??0),0); }
  get classroomCapacity(): number { return this.classrooms.reduce((total, room)=>total+room.capacity,0); }
  get classroomVacancies(): number { return Math.max(0,this.classroomCapacity-this.classroomOccupancy); }
  get stats() {
    return [
      {label:'Estudiantes',value:this.summary.students,detail:'matriculados '+this.year,icon:'group',tone:'blue'},
      {label:'Docentes',value:this.summary.teachers,detail:'activos',icon:'person_check',tone:'emerald'},
      {label:'Matrículas',value:this.summary.enrollments,detail:'activas · '+this.summary.pending+' pendientes',icon:'assignment',tone:'green'},
      {label:'Asistencia',value:this.summary.attendance+'%',detail:'presencias y tardanzas registradas',icon:'event_available',tone:'orange'},
      {label:'Promedio Gral.',value:this.summary.average,detail:'sobre 20 — '+this.activePeriodLabel,icon:'workspace_premium',tone:'violet'},
      {label:'Comunicados',value:this.summary.unread,detail:'sin leer',icon:'chat_bubble_outline',tone:'red'}
    ];
  }
  get donut(): string {
    const sum=this.summary.distribution.reduce((n,g)=>n+g.total,0); let start=0;
    if(!sum) return '#e2e8f0';
    return 'conic-gradient('+this.summary.distribution.map((g,i)=>{const end=start+g.total/sum*100; const part=this.colors[i]+' '+start+'% '+end+'%';start=end;return part;}).join(',')+')';
  }
  get modalTitle(): string {
    const names: Record<Resource,string>={students:'alumna',guardians:'apoderado',roles:'rol',teachers:'docente',courses:'curso',enrollments:'matrícula',schedules:'bloque de horario',classrooms:'grado y sección','academic-years':'año académico','academic-periods':'periodo académico',communications:'comunicado',users:'usuario','administrative-staff':'personal administrativo',competencies:'competencia','teacher-assignments':'docente titular de aula','academic-events':'evento académico',evaluations:'evaluación','student-documents':'documento de la alumna','student-observations':'observación académica'};
    return (this.editingId?'Editar ':'Registrar ')+(this.modal?names[this.modal]:'');
  }
  get fields(): Field[] {
    const text=(key:string,label:string,required=true,type='text'):Field=>({key,label,required,type});
    const select=(key:string,label:string,options:{value:FormValue;label:string}[],required=true):Field=>({key,label,type:'select',options,required});
    const options=(values:string[])=>values.map(value=>({value,label:value}));
    const estadoPersona=(valores=['Activo','Inactivo']):Field[]=>this.editingId?[select('status','Estado',options(valores))]:[];
    const userOptions=(role:Role)=>[{value:null,label:'Sin cuenta vinculada'},...this.users.filter(u=>this.userScope(u)===role&&u.active).map(u=>({value:u.id,label:u.name+' — '+u.email}))];
    switch(this.modal) {
      case 'students': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('birth_date','Fecha de nacimiento',false,'date'),select('guardian_id','Apoderado',this.guardians.map(item=>({value:item.id,label:item.name+' · '+item.phone+(item.status==='Activo'?'':' · Inactivo')}))),...estadoPersona(['Activo','Inactivo','Trasladado'])];
      case 'guardians': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('phone','Teléfono'),text('email','Correo / usuario de acceso',true,'email'),text('address','Dirección',false),...(!this.draft['user_id']?[text('password','Contraseña de acceso (mínimo 8 caracteres)',true,'password')]:[]),...(this.editingId?[select('status','Estado',options(['Activo','Inactivo']))]:[])];
      case 'roles': return [text('code','Código del rol'),text('name','Nombre visible'),text('description','Descripción',true,'textarea'),select('scope','Nivel de acceso',[{value:'admin',label:'Administrador — acceso completo'},{value:'docente',label:'Docente — gestión académica asignada'},{value:'padre',label:'Apoderado — consulta familiar'}]),text('icon','Icono de Material Symbols'),select('active','Estado',[{value:true,label:'Activo'},{value:false,label:'Inactivo'}])];
      case 'teachers': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('email','Correo institucional',true,'email'),text('phone','Teléfono',false),select('user_id','Cuenta docente',userOptions('docente'),false),...estadoPersona()];
      case 'courses': return [text('name','Nombre del curso'),text('category','Área académica'),{...text('hours','Horas semanales',true,'number'),min:1,max:40},text('description','Descripción',false,'textarea'),text('color','Color',true,'color')];
      case 'enrollments': return [select('student_id','Estudiante',this.enrollmentCandidates.map(s=>({value:s.id,label:s.name}))),{...text('year','Año académico',true,'number'),min:2020,max:2100},text('enrolled_at','Fecha de matrícula',true,'date'),select('status','Estado',options(['Activo','Pendiente','Cancelado']))];
      case 'schedules': return [select('course_id','Curso',this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.draft['classroom_id']))).map(c=>({value:c.id,label:c.name}))),select('day','Día',this.days.map((label,i)=>({value:i+1,label}))),text('starts_at','Hora de inicio',true,'time'),text('ends_at','Hora de fin',true,'time')];
      case 'classrooms': return [{...text('year','Año académico',true,'number'),min:2020,max:2100},select('grade','Grado',[1,2,3,4,5,6].map(value=>({value,label:value+'° Grado'}))),text('section','Sección (A, B, C)'),{...text('capacity','Capacidad de estudiantes',true,'number'),min:1,max:100}];
      case 'academic-years': return [{...text('year','Año académico',true,'number'),min:2020,max:2100},text('starts_on','Fecha de inicio',true,'date'),text('ends_on','Fecha de término',true,'date'),select('period_type','Organización del año',options(['Bimestral','Trimestral'])),select('status','Estado',options(['Planificado','Activo','Cerrado']))];
      case 'academic-periods': {const year=this.academicYears.find(item=>item.id===Number(this.draft['academic_year_id']));const max=year?.period_type==='Trimestral'?3:4;const label=max===3?'Trimestre':'Bimestre';return [select('academic_year_id','Año académico',this.academicYears.map(item=>({value:item.id,label:String(item.year)+' · '+item.period_type}))),select('number','Número de periodo',Array.from({length:max},(_,index)=>({value:index+1,label:label+' '+(index+1)}))),text('name','Nombre del periodo'),text('starts_on','Fecha de inicio',true,'date'),text('ends_on','Fecha de término',true,'date'),select('status','Estado',options(['Planificado','Activo','Cerrado']))];}
      case 'communications': return [select('type','Tipo',options(['Comunicado','Circular','Urgente'])),text('subject','Asunto'),select('audience','Destinatarios',this.admin?[{value:'all',label:'Toda la comunidad'},{value:'docente',label:'Docentes'},{value:'padre',label:'Apoderados'},{value:'admin',label:'Administración'}]:[{value:'padre',label:'Apoderados de la sección'},{value:'all',label:'Comunidad de la sección'}]),text('body','Mensaje',true,'textarea')];
      case 'users': return [text('name','Nombre completo'),text('email','Correo',true,'email'),select('role','Perfil',this.systemRoles.filter(role=>role.active).map(role=>({value:role.code,label:role.name}))),text('password','Contraseña inicial (mínimo 10 caracteres)',true,'password')];
      case 'administrative-staff': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('email','Correo institucional',true,'email'),text('phone','Teléfono',false),select('position','Cargo',options(['Director','Coordinador','Auxiliar','Secretaría','Administrativo'])),select('user_id','Cuenta de acceso',userOptions('admin'),false),...estadoPersona()];
      case 'competencies': return [select('course_id','Curso',this.courses.map(c=>({value:c.id,label:c.name}))),select('grade','Grado',[{value:null,label:'Todos los grados'},...[1,2,3,4,5,6].map(value=>({value,label:value+'° grado'}))],false),text('name','Competencia'),text('capacity','Capacidad',true,'textarea'),text('performance','Desempeño',true,'textarea'),text('evaluation_criterion','Criterio de evaluación',true,'textarea'),select('status','Estado',options(['Activo','Inactivo']))];
      case 'teacher-assignments': return [select('teacher_id','Docente',this.teachers.filter(t=>t.status==='Activo').map(t=>({value:t.id,label:t.name}))),select('status','Estado',options(['Activo','Inactivo']))];
      case 'academic-events': return [text('title','Título'),select('type','Tipo',options(['Evaluación','Reunión','Feriado','Actividad escolar','Fecha importante'])),text('starts_at','Inicio',true,'datetime-local'),text('ends_at','Fin',false,'datetime-local'),text('description','Descripción',false,'textarea'),select('status','Estado',options(['Programado','Realizado','Cancelado']))];
      case 'evaluations': {const room=this.classrooms.find(item=>item.id===Number(this.draft['classroom_id']));const availableCourses=this.courses.filter(item=>item.classrooms.some(classroom=>classroom.id===room?.id));return [select('academic_period_id','Periodo',this.periods.map(p=>({value:p.id,label:p.name+' · '+p.status}))),select('classroom_id','Grado y sección',this.classrooms.map(r=>({value:r.id,label:this.roomLabel(r)}))),select('course_id','Curso',availableCourses.map(c=>({value:c.id,label:c.name}))),select('competency_id','Competencia evaluada',this.availableEvaluationCompetencies.map(item=>({value:item.id,label:item.name}))),text('title','Título'),select('type','Tipo',options(['Práctica','Examen','Proyecto','Tarea','Participación'])),text('evaluation_date','Fecha',true,'date'),{...text('max_score','Puntaje máximo',true,'number'),min:1,max:100},{...text('weight','Peso porcentual',true,'number'),min:0.01,max:100},select('status','Estado',options(['Programada','Aplicada','Calificada','Cancelada']))];}
      case 'student-documents': return [select('student_id','Estudiante',this.students.map(s=>({value:s.id,label:s.name}))),text('type','Tipo de documento'),text('document_number','Número / código',false),text('issued_on','Fecha de emisión',false,'date'),text('expires_on','Fecha de vencimiento',false,'date'),select('status','Estado',options(['Vigente','Pendiente','Vencido'])),text('notes','Notas',false,'textarea')];
      case 'student-observations': return [select('enrollment_id','Estudiante',this.reportCards.map(r=>({value:r.enrollment_id,label:r.student.name}))),select('academic_period_id','Periodo',this.periods.map(p=>({value:p.id,label:p.name}))),select('type','Tipo',options(['Académica','Conductual','Tutoría','Reconocimiento'])),text('observed_on','Fecha',true,'date'),text('observation','Observación',true,'textarea')];
      default:return [];
    }
  }

  private async run(work:()=>Promise<void>, success=''): Promise<void> {
    if(this.busy) return;
    this.busy=true;this.error='';this.notice='';this.cdr.markForCheck();
    try { await work(); if(success) this.notice=success; }
    catch(error) { this.error=error instanceof Error?error.message:'No se pudo completar la operación.'; if(error instanceof ErrorApi&&error.status===401){this.authenticated=false;this.user=null;} }
    finally {
      this.busy=false;this.cdr.markForCheck();
      if(this.pendingRouteLoad){this.pendingRouteLoad=false;void this.run(()=>this.loadModule());}
    }
  }

  async restore(): Promise<void> {
    try {
      await this.api.prepararCsrf();
      const response=await this.api.solicitar<{user:User}>('me');
      await this.startAuthenticatedSession(response.user,false);
    } catch(error) {
      this.authenticated=false;this.user=null;
      if(error instanceof ErrorApi&&error.status===401){
        this.error='';
      } else this.error=error instanceof Error?error.message:'No se pudo comprobar la sesión.';
    }
    finally {this.restoring=false;this.cdr.markForCheck();}
  }
  login():void {
    void this.run(async()=>{
      const response=await this.api.solicitar<{user:User}>('login','POST',this.loginForm);
      await this.startAuthenticatedSession(response.user,true);
      this.loginForm.password='';
    });
  }
  logout():void {
    void this.run(async()=>{
      await this.api.solicitar('logout','POST');
      this.authenticated=false;this.user=null;this.settingsOpen=false;this.profileOpen=false;
      this.permissions={};this.navGroups=[];
      this.mobileOpen=false;this.modal=null;this.onboardingOpen=false;this.loginForm.password='';
      this.notice='';this.error='';
      await this.api.prepararCsrf();
    });
  }
  private async startAuthenticatedSession(user:User,showWelcome:boolean):Promise<void> {
    this.user=user;this.selectedRole=user.role;this.authenticated=true;
    await this.bootstrap(true);
    if(!this.can(this.activeModule)) await this.router.navigate(['/dashboard']);
    await this.loadModule();
    if(showWelcome){
      const key='ie-80404-bienvenida-'+user.id;
      this.onboardingOpen=localStorage.getItem(key)!=='vista';
    }
  }
  private async bootstrap(resetDefaults=false): Promise<void> {
    const data=await this.api.solicitar<Bootstrap>('bootstrap'+(resetDefaults?'':'?year='+this.year));
    this.permissions=data.permissions;
    this.navGroups=((data.user.role_record?.scope ?? data.user.role) === 'padre' ? GRUPOS_NAVEGACION_FAMILIA : GRUPOS_NAVEGACION).map(grupo=>({
      ...grupo,
      secciones:grupo.secciones.map(seccion=>({
        ...seccion,
        elementos:seccion.elementos.filter(elemento=>this.can(elemento.id)),
      })).filter(seccion=>seccion.elementos.length>0),
    })).filter(grupo=>grupo.secciones.length>0);
    this.user=data.user;this.selectedRole=data.user.role;this.settings={...this.settings,...data.settings,achievement_rules:data.settings.achievement_rules??this.settings.achievement_rules};this.periods=data.periods;
    this.year=data.year;
    if(resetDefaults) this.period=data.settings.period;
    if(!this.periods.some(p=>p.number===Number(this.period))) this.period=this.periods.find(p=>p.status==='Activo')?.number??this.periods[0]?.number??1;
    this.classrooms=data.classrooms;this.courses=data.courses;this.teachers=data.teachers;this.summary=data.dashboard;
    if(!this.classrooms.some(c=>c.id===Number(this.selectedClassroomId))) this.selectedClassroomId=this.classrooms.find(c=>c.grade===5&&c.section==='A')?.id??this.classrooms[0]?.id??0;
    this.selectDefaultCourse();
  }
  private selectDefaultCourse():void { if(!this.classroomCourses.some(c=>c.id===Number(this.selectedCourseId))) this.selectedCourseId=this.classroomCourses[0]?.id??0; }
  refresh(): void {void this.run(async()=>{await this.bootstrap();await this.loadModule();});}
  selectModule(module:ModuleId):void {
    if(this.busy || !this.can(module)) return;
    void this.router.navigate(['/', this.modulePaths[module]]);
  }
  filter():void {this.page=1;void this.run(()=>this.loadModule());}
  paginate(page:number):void {if(page<1||page>this.lastPage)return;this.page=page;void this.run(()=>this.loadModule());}
  changeClassroom():void {this.selectDefaultCourse();void this.run(()=>this.loadModule());}
  changeModalClassroom(aulaId:number|null):void {this.draft['classroom_id']=aulaId;if(this.modal==='schedules')this.syncScheduleFields();}
  changePeriod():void {void this.run(()=>this.loadModule());}
  changeAcademicYear():void {void this.run(()=>this.loadAcademicPeriods());}
  toggleAcademicYear(item:AcademicYear):void {
    const active=item.status!=='Activo';
    void this.run(async()=>{
      await this.api.solicitar('academic-years/'+item.id+'/activation','PUT',{active});
      if(active){this.year=item.year;this.selectedAcademicYearId=item.id;}
      await this.bootstrap();await this.loadModule();
    },active?'Año académico activado. Los demás años quedaron inactivos.':'Año académico desactivado.');
  }
  toggleAcademicPeriod(item:AcademicPeriod):void {
    const active=item.status!=='Activo';
    void this.run(async()=>{
      await this.api.solicitar('academic-periods/'+item.id+'/activation','PUT',{active});
      if(active){
        const academicYear=this.academicYears.find(year=>year.id===item.academic_year_id);
        this.year=academicYear?.year??this.year;this.period=item.number;this.selectedAcademicYearId=item.academic_year_id;
      }
      await this.bootstrap();await this.loadModule();
    },active?'Periodo académico activado. Los demás periodos quedaron inactivos.':'Periodo académico desactivado.');
  }
  toggleEnrollmentStatus(item:Enrollment):void {
    const active=item.status!=='Activo';
    void this.run(async()=>{
      await this.matriculasServicio.actualizarEstado(item.id,active);
      await this.loadModule();await this.bootstrap();
    },active?'Matrícula activada.':'Matrícula marcada como pendiente.');
  }
  toggleRoleStatus(item:SystemRole):void {
    const active=!item.active;
    void this.run(async()=>{
      await this.api.solicitar('roles/'+item.id+'/activation','PUT',{active});
      await this.loadModule();
    },active?'Rol activado.':'Rol desactivado.');
  }
  private async loadAcademicPeriods():Promise<void> {
    this.academicPeriods=this.selectedAcademicYearId?await this.api.listarTodos<AcademicPeriod>('academic-periods?academic_year_id='+this.selectedAcademicYearId):[];
  }
  private async loadModule():Promise<void> {
    const params='?page='+this.page+'&per_page=8&q='+encodeURIComponent(this.query)+'&status='+encodeURIComponent(this.statusFilter);
    switch(this.activeModule) {
      case 'dashboard': this.summary=(await this.api.solicitar<{data:Summary}>('dashboard?year='+this.year+'&period='+this.period)).data;break;
      case 'students': {
        const resultado=await this.estudiantesServicio.listar({pagina:this.page,busqueda:this.query,estado:this.statusFilter,anio:this.year,grado:this.studentGradeFilter,aulaId:this.studentClassroomFilter});
        this.students=resultado.pagina.data;this.studentDocuments=resultado.documentos;this.applyPage(resultado.pagina);break;
      }
      case 'guardians': {const r=await this.api.solicitar<Page<Guardian>>('guardians'+params);this.guardians=r.data;this.applyPage(r);break;}
      case 'roles': {const [r,u]=await Promise.all([this.api.solicitar<Page<SystemRole>>('roles'+params),this.api.solicitar<{data:User[]}>('users')]);this.systemRoles=r.data;this.users=u.data;this.applyPage(r);break;}
      case 'personnel': this.administrativeStaff=await this.api.listarTodos<AdministrativeStaff>('management/administrative-staff?q='+encodeURIComponent(this.query)+'&status='+encodeURIComponent(this.statusFilter));break;
      case 'enrollment': {
        const r=await this.matriculasServicio.listar({pagina:this.page,busqueda:this.query,estado:this.statusFilter,anio:this.year,grado:this.enrollmentGradeFilter,aulaId:this.enrollmentClassroomFilter});this.enrollments=r.data;this.applyPage(r);break;
      }
      case 'classrooms': {const r=await this.api.solicitar<Page<Classroom>>('classrooms'+params+'&year='+this.year+(this.gradeFilter?'&grade='+this.gradeFilter:''));this.classroomRows=r.data;this.applyPage(r);break;}
      case 'academicCalendar':
        this.academicYears=await this.api.listarTodos<AcademicYear>('academic-years');
        if(!this.academicYears.some(item=>item.id===Number(this.selectedAcademicYearId))) this.selectedAcademicYearId=this.academicYears.find(item=>item.year===Number(this.year))?.id??this.academicYears[0]?.id??0;
        await this.loadAcademicPeriods();break;
      case 'teacherAssignments': this.teacherAssignments=await this.api.listarTodos<TeacherAssignment>('management/teacher-assignments?year='+this.year);break;
      case 'events':
        this.academicEvents=await this.api.listarTodos<AcademicEvent>('management/academic-events?academic_year_id='+(this.periods.find(p=>p.number===Number(this.period))?.academic_year_id??this.periods[0]?.academic_year_id??0));break;
      case 'attendance':
        this.attendanceRows=await this.asistenciaServicio.listar(this.selectedClassroomId,this.date);
        this.attendance=Object.fromEntries(this.attendanceRows.map(e=>[e.id,e.attendances?.[0]?.status??'']));break;
      case 'grades':
        this.gradeRows=this.selectedClassroomId?(await this.api.solicitar<{data:Enrollment[]}>('grades?classroom_id='+this.selectedClassroomId+'&period='+this.period)).data:[];
        this.updateScores();break;
      case 'evaluations': [this.evaluations,this.competencies]=await Promise.all([this.evaluacionesServicio.listar(this.selectedClassroomId,this.activePeriodId),this.api.listarTodos<Competency>('management/competencies')]);break;
      case 'tracking': this.reportCards=await this.seguimientoServicio.obtenerLibretas(this.selectedClassroomId,this.activePeriodId);break;
      case 'courses': this.competencies=await this.api.listarTodos<Competency>('management/competencies?q='+encodeURIComponent(this.query));break;
      case 'schedule': this.schedules=this.selectedClassroomId?await this.api.listarTodos<Schedule>('schedules?classroom_id='+this.selectedClassroomId):[];break;
      case 'communications':
        this.messages=await this.api.listarTodos<Communication>('communications?q='+encodeURIComponent(this.query));
        this.messages.sort((a,b)=>b.id-a.id);this.selectedMessage=this.messages.find(m=>m.id===this.selectedMessage?.id)??this.visibleMessages[0]??null;break;
      case 'reports':break;
    }
  }
  private activateRoute(url:string):void {
    const path=url.split(/[?#]/,1)[0].replace(/^\/+|\/+$/g,'');
    const module=(Object.entries(this.modulePaths).find(([,route])=>route===path)?.[0] ?? 'dashboard') as ModuleId;
    if(this.authenticated && Object.keys(this.permissions).length && !this.can(module)) {
      void this.router.navigate(['/dashboard']);
      return;
    }
    if(this.activeModule===module) return;
    this.activeModule=module;this.mobileOpen=false;this.profileOpen=false;
    this.query='';this.statusFilter='';this.gradeFilter=0;this.studentGradeFilter=0;this.studentClassroomFilter=null;this.enrollmentGradeFilter=0;this.enrollmentClassroomFilter=null;this.page=1;
    if(this.authenticated&&!this.restoring){
      if(this.busy) this.pendingRouteLoad=true;
      else void this.run(()=>this.loadModule());
    }
    this.cdr.markForCheck();
  }
  private applyPage<T>(r:Page<T>):void {this.total=r.total;this.page=r.current_page;this.lastPage=r.last_page;this.from=r.from??0;this.to=r.to??0;}
  updateScores():void {
    this.scores=Object.fromEntries(this.gradeRows.map(e=>[e.id,e.grades?.find(g=>g.course_id===Number(this.selectedCourseId))?.score??null]));
    this.originalScores={...this.scores};
  }
  selectGradeCourse(courseId:number):void {this.selectedCourseId=courseId;this.updateScores();}
  resetScores():void {this.scores={...this.originalScores};}
  validScore(score:number|null):boolean {return score===null||(Number.isFinite(Number(score))&&Number(score)>=0&&Number(score)<=20);}
  focusNextScore(event:Event):void {
    event.preventDefault();
    const current=event.target as HTMLInputElement;
    const inputs=Array.from(document.querySelectorAll<HTMLInputElement>('.score-input'));
    inputs[inputs.indexOf(current)+1]?.focus();
  }
  setAttendance(id:number,state:AttendanceState):void {this.attendance={...this.attendance,[id]:state};}
  attendanceLabel(state:AttendanceState):string {
    return {P:'Presente',F:'Falta',T:'Tardanza',J:'Justificado'}[state];
  }
  markAll(state:AttendanceState):void {this.attendance=Object.fromEntries(this.attendanceRows.map(e=>[e.id,state]));}
  saveAttendance():void {void this.run(async()=>{
    const records=this.attendanceRows.map(e=>({enrollment_id:e.id,status:this.attendance[e.id] as AttendanceState}));
    if(records.some(r=>!r.status)) throw new Error('Marca la asistencia de todos los estudiantes antes de guardar.');
    await this.asistenciaServicio.guardar(this.selectedClassroomId,this.date,records);
    await this.loadModule();await this.bootstrap();
  },'Asistencia guardada en la base de datos.');}
  saveGrades():void {void this.run(async()=>{
    if(this.periodClosed) throw new Error('El periodo está cerrado y sus notas son de solo lectura.');
    if(this.invalidScores) throw new Error('Las calificaciones deben estar entre 0 y 20.');
    const records=this.gradeRows.map(e=>({enrollment_id:e.id,score:this.scores[e.id]===null?null:Number(this.scores[e.id])}));
    if(!records.length) throw new Error('No hay estudiantes para calificar.');
    await this.api.solicitar('grades','PUT',{classroom_id:this.selectedClassroomId,course_id:this.selectedCourseId,period:this.period,records});
    await this.loadModule();await this.bootstrap();
  },'Calificaciones guardadas.');}
  async openModal(resource:Resource, record?:object):Promise<void> {
    if(!this.can(this.resourceModules[resource],record?'update':'create')) {this.error='No tienes permiso para esta acción.';return;}
    await this.run(async()=>{
      if(this.admin&&(resource==='students'||resource==='teachers'||resource==='users')) this.users=(await this.api.solicitar<{data:User[]}>('users')).data;
      if(resource==='users') this.systemRoles=await this.api.listarTodos<SystemRole>('roles');
      if(resource==='administrative-staff') this.users=(await this.api.solicitar<{data:User[]}>('users')).data;
      if(resource==='students') this.guardians=await this.api.listarTodos<Guardian>('guardians');
      if(resource==='evaluations') this.competencies=await this.api.listarTodos<Competency>('management/competencies');
      if(resource==='enrollments') {
        this.enrollmentCandidates=await this.matriculasServicio.candidatos(this.year);
        if(record) {
          const current=(record as Enrollment).student;
          if(!this.enrollmentCandidates.some(student=>student.id===current.id)) this.enrollmentCandidates=[current,...this.enrollmentCandidates];
        }
      }
      this.editingId=record&&'id' in record?Number(record.id):null;
      this.draft={name:'',code:'',description:'',scope:'padre',icon:'badge',active:true,dni:'',email:'',phone:'',address:'',guardian:'',guardian_id:this.guardians.find(item=>item.status==='Activo')?.id??this.guardians[0]?.id??null,guardian_user_id:null,user_id:null,status:'Activo',color:'#3b82f6',soft:'#eff6ff',hours:4,teacher_id:this.teachers.find(t=>t.status==='Activo')?.id??null,classroom_id:this.selectedClassroomId||null,student_id:null,year:this.year,enrolled_at:this.date,grade:1,section:'A',capacity:30,day:1,starts_at:'07:30',ends_at:'08:15',course_id:this.classroomCourses[0]?.id??this.courses[0]?.id??null,competency_id:null,type:'Comunicado',subject:'',body:'',audience:this.admin?'all':'padre',draft:false,role:this.systemRoles.find(item=>item.scope==='docente'&&item.active)?.code??'docente',password:'',position:'Administrativo',academic_period_id:this.activePeriodId,academic_year_id:this.academicYears.find(a=>a.year===this.year)?.id??null,weekly_hours:4,title:'',evaluation_date:this.date,max_score:20,weight:100,performance:'',evaluation_criterion:'',document_number:'',issued_on:'',expires_on:'',notes:'',enrollment_id:null,observed_on:this.date,observation:''};
      if(resource==='enrollments'&&!record) this.draft['student_id']=this.enrollmentCandidates[0]?.id??null;
      if(resource==='academic-years') this.draft={year:new Date().getFullYear()+1,starts_on:(new Date().getFullYear()+1)+'-03-01',ends_on:(new Date().getFullYear()+1)+'-12-20',period_type:'Bimestral',status:'Planificado'};
      if(resource==='academic-events') Object.assign(this.draft,{type:'Actividad escolar',status:'Programado',starts_at:this.date+'T08:00',ends_at:''});
      if(resource==='evaluations') Object.assign(this.draft,{type:'Práctica',status:'Programada',competency_id:this.availableEvaluationCompetencies[0]?.id??null});
      if(resource==='competencies') Object.assign(this.draft,{capacity:'',grade:null});
      if(resource==='student-documents') Object.assign(this.draft,{type:'Partida de nacimiento',status:'Vigente'});
      if(resource==='student-observations') Object.assign(this.draft,{type:'Académica'});
      if(resource==='academic-periods') {
        const academicYearId=this.selectedAcademicYearId||this.academicYears[0]?.id||0;
        const used=this.academicPeriods.map(item=>item.number);
        const max=this.academicYears.find(item=>item.id===academicYearId)?.period_type==='Trimestral'?3:4;
        const number=Array.from({length:max},(_,index)=>index+1).find(item=>!used.includes(item))??1;
        const label=max===3?'Trimestre':'Bimestre';
        this.draft={academic_year_id:academicYearId,number,name:label+' '+number,status:'Planificado',...this.periodDateDefaults(academicYearId,number)};
      }
      if(record) for(const [key,value] of Object.entries(record)) if(value===null||['string','number','boolean'].includes(typeof value)) this.draft[key]=value as FormValue;
      if(resource==='schedules'){this.draft['starts_at']=String(this.draft['starts_at']).slice(0,5);this.draft['ends_at']=String(this.draft['ends_at']).slice(0,5);this.syncScheduleFields();}
      this.selectedRoomIds=resource==='courses'&&record?(record as Course).classrooms.map(r=>r.id):this.classrooms.map(r=>r.id);
      const assignedRoom=this.classrooms.find(r=>this.selectedRoomIds.includes(r.id));
      this.assignmentGrade=assignedRoom?.grade??this.classroom?.grade??this.classroomGrades[0]??0;
      this.modalSnapshot=this.currentModalState();
      this.modal=resource;
    });
  }
  toggleRoom(id:number):void {this.selectedRoomIds=this.selectedRoomIds.includes(id)?this.selectedRoomIds.filter(v=>v!==id):[...this.selectedRoomIds,id];}
  fieldChanged(key:string):void {
    if(this.modal==='schedules'&&(key==='classroom_id'||key==='course_id'))this.syncScheduleFields();
    if(this.modal==='academic-periods'&&!this.editingId&&(key==='academic_year_id'||key==='number')) {
      const academicYearId=Number(this.draft['academic_year_id']);const number=Number(this.draft['number']);
      const label=this.academicYears.find(item=>item.id===academicYearId)?.period_type==='Trimestral'?'Trimestre':'Bimestre';
      this.draft={...this.draft,name:label+' '+number,...this.periodDateDefaults(academicYearId,number)};
    }
    if(this.modal==='evaluations'&&(key==='course_id'||key==='classroom_id')) {
      if(key==='classroom_id') {
        const room=this.classrooms.find(item=>item.id===Number(this.draft['classroom_id']));
        const courses=this.courses.filter(item=>item.classrooms.some(classroom=>classroom.id===room?.id));
        if(!courses.some(item=>item.id===Number(this.draft['course_id']))) this.draft['course_id']=courses[0]?.id??null;
      }
      if(!this.availableEvaluationCompetencies.some(item=>item.id===Number(this.draft['competency_id']))) this.draft['competency_id']=this.availableEvaluationCompetencies[0]?.id??null;
    }
  }
  private periodDateDefaults(academicYearId:number,number:number):{starts_on:string;ends_on:string} {
    const academicYear=this.academicYears.find(item=>item.id===academicYearId);
    if(!academicYear)return {starts_on:'',ends_on:''};
    const start=new Date(academicYear.starts_on+'T00:00:00');const end=new Date(academicYear.ends_on+'T00:00:00');
    const divisions=academicYear.period_type==='Trimestral'?3:4;
    const days=Math.floor((end.getTime()-start.getTime())/86400000)+1;
    const startsOn=new Date(start.getTime()+Math.floor(days*(number-1)/divisions)*86400000);
    const endsOn=new Date(start.getTime()+(Math.floor(days*number/divisions)-1)*86400000);
    const format=(value:Date)=>value.toLocaleDateString('en-CA');
    return {starts_on:format(startsOn),ends_on:format(endsOn)};
  }
  private syncScheduleFields():void {
    const available=this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.draft['classroom_id'])));
    if(!available.some(c=>c.id===Number(this.draft['course_id'])))this.draft['course_id']=available[0]?.id??null;
    const aula=this.classrooms.find(r=>r.id===Number(this.draft['classroom_id']));
    this.draft['teacher_id']=aula?.active_assignment?.teacher_id??null;
  }
  private currentModalState():string{return JSON.stringify({draft:this.draft,rooms:this.selectedRoomIds});}
  private currentSettingsState():string{return JSON.stringify({settings:this.settings,password:this.passwordForm});}
  closeModal():void {if(this.busy)return;if(this.modalHasChanges){this.confirmDiscard='modal';return;}this.discardModal();}
  closeSettings():void {if(this.busy)return;if(this.settingsHasChanges){this.confirmDiscard='settings';return;}this.discardSettings();}
  openGuardianContact(guardian:Guardian):void {
    if(!this.can('guardians','updateOwn'))return;
    this.selectedGuardian=null;
    this.guardianContactDraft={phone:guardian.phone,email:guardian.email??'',address:guardian.address??''};
    this.guardianContactSnapshot=JSON.stringify(this.guardianContactDraft);
    this.guardianContactOpen=true;
  }
  closeGuardianContact():void {if(this.busy)return;if(this.guardianContactHasChanges){this.confirmDiscard='guardian';return;}this.discardGuardianContact();}
  saveGuardianContact():void {void this.run(async()=>{
    await this.api.solicitar('guardian-profile','PUT',this.guardianContactDraft);
    this.discardGuardianContact();
    await this.loadModule();
    this.selectedGuardian=(await this.api.solicitar<{data:Guardian}>('guardian-profile')).data;
  },'Datos de contacto actualizados.');}
  discardChanges():void {const target=this.confirmDiscard;this.confirmDiscard=null;if(target==='modal')this.discardModal();if(target==='evaluation')this.discardEvaluation();if(target==='settings')this.discardSettings();if(target==='guardian')this.discardGuardianContact();}
  private discardModal():void {this.modal=null;this.modalSnapshot='';this.error='';}
  private discardEvaluation():void {this.selectedEvaluation=null;this.evaluationSnapshot='';this.error='';}
  private discardSettings():void {this.settingsOpen=false;this.settingsSnapshot='';this.passwordForm={current_password:'',password:'',password_confirmation:''};this.error='';}
  private discardGuardianContact():void {this.guardianContactOpen=false;this.guardianContactSnapshot='';this.error='';}
  saveModal(draft=false):void {void this.run(async()=>{
    if(!this.modal) return;
    const resource=this.modal;
    if(resource==='evaluations'&&!this.availableEvaluationCompetencies.length) throw new Error('Este curso no tiene competencias activas para el grado. Agrégalas en Cursos y competencias antes de registrar la evaluación.');
    const body:Record<string,unknown>={};
    this.fields.forEach(f=>{body[f.key]=this.draft[f.key]===''&&!f.required?null:this.draft[f.key];});
    if(resource==='enrollments'||resource==='schedules'||resource==='communications'||resource==='teacher-assignments') body['classroom_id']=this.draft['classroom_id'];
    if(resource==='schedules') body['teacher_id']=this.draft['teacher_id'];
    if(resource==='courses'){body['classroom_ids']=this.selectedRoomIds;body['soft']=this.draft['soft'];}
    if(resource==='communications') body['draft']=draft;
    const endpoint=this.resourceEndpoint(resource)+(this.editingId?'/'+this.editingId:'');
    await this.api.solicitar(endpoint,this.editingId?'PUT':'POST',body);
    if(resource==='classrooms') this.year=Number(body['year']);
    if(resource==='academic-years'&&body['status']==='Activo') this.year=Number(body['year']);
    if(resource==='academic-periods'&&body['status']==='Activo') {
      this.period=Number(body['number']);
      this.year=this.academicYears.find(item=>item.id===Number(body['academic_year_id']))?.year??this.year;
    }
    this.modal=null;this.modalSnapshot='';
    if(resource==='users') this.users=(await this.api.solicitar<{data:User[]}>('users')).data;
    await this.bootstrap();await this.loadModule();
  },'Registro guardado.');}
  deleteRecord():void {void this.run(async()=>{
    if(!this.confirmDelete)return;
    await this.api.solicitar(this.resourceEndpoint(this.confirmDelete.resource)+'/'+this.confirmDelete.id,'DELETE');
    this.confirmDelete=null;await this.bootstrap();await this.loadModule();
  },'Registro eliminado.');}
  private resourceEndpoint(resource:Resource):string {
    return ['administrative-staff','competencies','teacher-assignments','academic-events','evaluations','student-documents','student-observations'].includes(resource)?'management/'+resource:resource;
  }
  openEvaluationScores(evaluation:Evaluation):void {void this.run(async()=>{
    this.selectedEvaluation=evaluation;
    this.evaluationEnrollments=await this.evaluacionesServicio.matriculas(evaluation.classroom_id,evaluation.academic_period?.number??this.period);
    this.evaluationScores=Object.fromEntries(this.evaluationEnrollments.map(item=>[item.id,evaluation.scores.find(score=>score.enrollment_id===item.id)?.score??null]));
    this.evaluationSnapshot=JSON.stringify(this.evaluationScores);
  });}
  closeEvaluationScores():void {if(this.busy)return;if(this.evaluationHasChanges){this.confirmDiscard='evaluation';return;}this.discardEvaluation();}
  saveEvaluationScores():void {if(!this.selectedEvaluation)return;void this.run(async()=>{
    const evaluation=this.selectedEvaluation!;
    await this.evaluacionesServicio.guardarNotas(evaluation.id,this.evaluationEnrollments.map(item=>({enrollment_id:item.id,score:this.evaluationScores[item.id],observation:null})));
    this.selectedEvaluation=null;this.evaluationSnapshot='';await this.loadModule();
  },'Notas de la evaluación guardadas.');}
  achievementLevel(score:number|null,maxScore=20):string|null {if(score===null)return null;const normalized=Number(score)*20/Number(maxScore||20);return this.settings.achievement_rules.find(rule=>normalized>=Number(rule.min))?.level??'C';}
  downloadReportCard(item:ReportCard):void {void this.run(()=>this.seguimientoServicio.descargarLibreta(item.enrollment_id,this.activePeriodId,`libreta-${item.student.name.toLowerCase().replace(/[^a-záéíóúñ0-9]+/gi,'-')}.pdf`),'Libreta PDF generada.');}
  documentsFor(studentId:number):StudentDocument[]{return this.studentDocuments.filter(document=>document.student_id===studentId);}
  readMessage(message:Communication):void {this.selectedMessage=message; if(message.draft)return;void this.run(async()=>{
    await this.api.solicitar('communications/'+message.id+'/receipt','PUT',{});await this.loadModule();await this.bootstrap();
  });}
  archiveMessage():void {if(!this.selectedMessage)return;const id=this.selectedMessage.id;void this.run(async()=>{
    await this.api.solicitar('communications/'+id+'/receipt','PUT',{archived:!this.showArchived});await this.loadModule();this.selectedMessage=this.visibleMessages[0]??null;
  },'Comunicado actualizado.');}
  print():void {window.print();}
  openSettings():void {void this.run(async()=>{
    if(this.admin){
      this.users=(await this.api.solicitar<{data:User[]}>('users')).data;
      this.systemRoles=await this.api.listarTodos<SystemRole>('roles');
    }
    this.settingsSnapshot=this.currentSettingsState();this.settingsOpen=true;
  });}
  openProfile():void {
    if(this.currentAccessScope !== 'padre'){this.openSettings();return;}
    void this.run(async()=>{
      this.selectedGuardian=(await this.api.solicitar<{data:Guardian}>('guardian-profile')).data;
    });
  }
  saveSettings():void {void this.run(async()=>{
    await this.api.solicitar('settings','PUT',this.settings);this.year=Number(this.settings.year);await this.bootstrap();await this.loadModule();this.settingsSnapshot=this.currentSettingsState();
  },'Configuración guardada.');}
  savePassword():void {void this.run(async()=>{
    await this.api.solicitar('password','PUT',this.passwordForm);this.passwordForm={current_password:'',password:'',password_confirmation:''};this.settingsSnapshot=this.currentSettingsState();
  },'Contraseña actualizada.');}
  toggleUser(u:User):void {void this.run(async()=>{
    await this.api.solicitar('users/'+u.id,'PUT',{active:!u.active});this.users=(await this.api.solicitar<{data:User[]}>('users')).data;
  },'Usuario actualizado.');}
  userScope(user:User):string {return user.role_record?.scope??user.role;}
  roleLabel(code:string):string {return this.systemRoles.find(role=>role.code===code)?.name??this.roleInfo[code]?.label??code;}
  scopeLabel(scope:string):string {return scope==='admin'?'Administrador':scope==='docente'?'Docente':'Apoderado';}
  initials(name:string):string {return name.replace(/^Prof\. /,'').split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('');}
  audienceLabel(audience:string):string {return audience==='admin'?'Administración':audience==='docente'?'Docentes':audience==='padre'?'Apoderados':'Comunidad educativa';}
  roomLabel(room:Classroom):string {return room.grade+'° — Sec. '+room.section;}
  classroomCourseNames(room:Classroom):string {return this.courses.filter(course=>course.classrooms.some(item=>item.id===room.id)).map(course=>course.name).join(', ');}
  studentEnrollment(s:Student):Enrollment|undefined {return s.enrollments?.find(e=>e.year===Number(this.year));}
  courseGrades(course:Course):string {return [...new Set(course.classrooms.filter(r=>r.year===Number(this.year)).map(r=>r.grade))].sort().map(g=>g+'°').join(', ');}
  private teacherAssignment(teacher:Teacher):TeacherAssignment|undefined {return teacher.assignments?.find(a=>a.status==='Activo'&&a.classroom?.year===Number(this.year));}
  teacherRoomLabel(teacher:Teacher):string {const room=this.teacherAssignment(teacher)?.classroom;return room?this.roomLabel(room):'Sin aula asignada';}
  teacherCourseCount(teacher:Teacher):number {const room=this.teacherAssignment(teacher)?.classroom;return room?this.courses.filter(c=>c.classrooms.some(r=>r.id===room.id)).length:0;}
  teacherHours(teacher:Teacher):number {const room=this.teacherAssignment(teacher)?.classroom;return room?this.courses.filter(c=>c.classrooms.some(r=>r.id===room.id)).reduce((sum,c)=>sum+c.hours,0):0;}
  teacherCourseNames(teacher:Teacher):string {const room=this.teacherAssignment(teacher)?.classroom;return room?this.courses.filter(c=>c.classrooms.some(r=>r.id===room.id)).map(c=>c.name).join(', '):'';}
  assignmentCourseCount(assignment:TeacherAssignment):number {return this.courses.filter(c=>c.classrooms.some(r=>r.id===assignment.classroom_id)).length;}
  modalClassroomTeacherName():string {return this.classrooms.find(r=>r.id===this.draftClassroomId)?.active_assignment?.teacher?.name??'Asigna primero una docente a esta aula';}
  unread(message:Communication):boolean {return !message.draft&&!message.readers[0]?.pivot.read_at;}
  scheduleFor(day:number):Schedule[] {return this.schedules.filter(s=>s.day===day).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));}
  get scheduleSlots():{start:string;end:string}[] {
    const times=new Set(['07:30','08:15','09:00','09:45','10:00','10:45','11:30','12:15']);
    for(const clase of this.schedules){times.add(clase.starts_at.slice(0,5));times.add(clase.ends_at.slice(0,5));}
    const sorted=[...times].sort();
    return sorted.slice(0,-1).map((start,index)=>({start,end:sorted[index+1]}));
  }
  private scheduleMinutes(time:string):number {const [h,m]=time.split(':').map(Number);return h*60+m;}
  get scheduleGridRows():string {
    return '52px '+this.scheduleSlots.map(slot=>slot.start==='09:45'?'54px':Math.max(50,(this.scheduleMinutes(slot.end)-this.scheduleMinutes(slot.start))*2.6)+'px').join(' ');
  }
  scheduleAt(day:number,start:string):Schedule|undefined {return this.schedules.find(s=>s.day===day&&s.starts_at.slice(0,5)===start);}
  scheduleOccupied(day:number,start:string):boolean {return this.schedules.some(s=>s.day===day&&s.starts_at.slice(0,5)<=start&&s.ends_at.slice(0,5)>start);}
  scheduleRowSpan(clase:Schedule):number {return this.scheduleSlots.filter(slot=>slot.start>=clase.starts_at.slice(0,5)&&slot.start<clase.ends_at.slice(0,5)).length;}
  gradeValue(e:Enrollment,courseId:number):number|null {return e.grades?.find(g=>g.course_id===courseId)?.score??null;}
  displayedGrade(e:Enrollment,courseId:number):number|null {return this.staff&&courseId===Number(this.selectedCourseId)?this.scores[e.id]??null:this.gradeValue(e,courseId);}
  averageValue(e:Enrollment):number|null {
    const values=this.classroomCourses.map(c=>this.displayedGrade(e,c.id)).filter((score):score is number=>score!==null&&Number.isFinite(Number(score))).map(Number);
    return values.length?values.reduce((sum,score)=>sum+score,0)/values.length:null;
  }
  average(e:Enrollment):string {const value=this.averageValue(e);return value===null?'—':value.toFixed(1);}
  closeOnboarding():void {if(this.user)localStorage.setItem('ie-80404-bienvenida-'+this.user.id,'vista');this.onboardingOpen=false;this.onboardingStep=0;}
  nextOnboarding():void {if(this.onboardingStep<2)this.onboardingStep++;else this.closeOnboarding();}
}
