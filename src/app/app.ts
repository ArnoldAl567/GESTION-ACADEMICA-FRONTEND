import { CommonModule } from '@angular/common';
import { afterNextRender, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AcademicApi, AcademicPeriod, AcademicYear, ApiError, AttendanceState, Bootstrap, Classroom, Communication, Course, Enrollment, Page, Report, Role, Schedule, Settings, Student, Summary, Teacher, User } from './academic-api';

type ModuleId = 'dashboard' | 'students' | 'teachers' | 'enrollment' | 'classrooms' | 'academicCalendar' | 'attendance' | 'courses' | 'schedule' | 'grades' | 'communications' | 'reports';
type Resource = 'students' | 'teachers' | 'courses' | 'enrollments' | 'schedules' | 'classrooms' | 'academic-years' | 'academic-periods' | 'communications' | 'users';
type FormValue = string | number | boolean | null;
interface Field { key: string; label: string; type?: string; required?: boolean; options?: {value: FormValue; label: string}[]; min?: number; max?: number; }

@Component({ selector: 'app-root', imports: [CommonModule, FormsModule, RouterOutlet], templateUrl: './app.html', styleUrl: './app.css' })
export class App {
  private readonly api = inject(AcademicApi);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private pendingRouteLoad = false;
  private pendingStudentSearch: string | null = null;
  authenticated = false;
  restoring = true;
  busy = false;
  error = '';
  notice = '';
  user: User | null = null;
  selectedRole: Role = 'admin';
  activeModule: ModuleId = 'dashboard';
  sidebarCollapsed = false;
  mobileOpen = false;
  profileOpen = false;
  onboardingOpen = false;
  onboardingStep = 0;
  search = '';
  query = '';
  statusFilter = '';
  categoryFilter = '';
  gradeFilter = 0;
  messageFilter = '';
  showArchived = false;
  page = 1;
  total = 0;
  lastPage = 1;
  from = 0;
  to = 0;
  year = 2026;
  period = 3;
  years: number[] = [];
  periods: AcademicPeriod[] = [];
  academicYears: AcademicYear[] = [];
  academicPeriods: AcademicPeriod[] = [];
  selectedAcademicYearId = 0;
  settings: Settings = {name: 'I.E. San Martín de Porres', year: 2026, period: 3};
  settingsOpen = false;
  users: User[] = [];
  passwordForm = {current_password: '', password: '', password_confirmation: ''};
  classrooms: Classroom[] = [];
  classroomRows: Classroom[] = [];
  selectedClassroomId = 0;
  selectedCourseId = 0;
  students: Student[] = [];
  teachers: Teacher[] = [];
  courses: Course[] = [];
  enrollments: Enrollment[] = [];
  schedules: Schedule[] = [];
  messages: Communication[] = [];
  selectedMessage: Communication | null = null;
  selectedStudent: Student | null = null;
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
  reportType = 'academic';
  report: Report | null = null;
  summary: Summary = {students:0,teachers:0,enrollments:0,pending:0,cancelled:0,attendance:0,average:0,unread:0,distribution:[],performance:[],weekly:[],trend:[],alerts:[],activity:[]};
  modal: Resource | null = null;
  editingId: number | null = null;
  draft: Record<string, FormValue> = {};
  selectedRoomIds: number[] = [];
  selectedTeacherCourseIds: number[] = [];
  selectedCourseTeacherIds: number[] = [];
  enrollmentCandidates: Student[] = [];
  confirmDelete: {resource: Resource; id: number; name: string} | null = null;
  readonly days = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
  readonly colors = ['#3b82f6','#10b981','#8b5cf6','#f59e0b','#ef4444','#ec4899'];
  readonly attendanceStates: AttendanceState[] = ['P','F','T','J'];
  readonly loginRoles: Role[] = ['admin','docente','padre'];
  readonly roleInfo: Record<Role, {label:string;description:string;icon:string;short:string}> = {
    admin: {label:'Administrador',description:'Director / Secretaría',icon:'admin_panel_settings',short:'Director'},
    docente: {label:'Docente',description:'Profesor / Tutor',icon:'school',short:'Docente'},
    padre: {label:'Padre / Apoderado',description:'Familia / Tutor legal',icon:'family_restroom',short:'Apoderado'}
  };
  readonly navItems: {id:ModuleId;label:string;icon:string}[] = [
    {id:'dashboard',label:'Dashboard',icon:'dashboard'},{id:'students',label:'Estudiantes',icon:'group'},
    {id:'teachers',label:'Docentes',icon:'person_check'},{id:'enrollment',label:'Matrículas',icon:'assignment'},
    {id:'classrooms',label:'Grados y secciones',icon:'meeting_room'},{id:'academicCalendar',label:'Años y periodos',icon:'calendar_month'},{id:'attendance',label:'Asistencia',icon:'fact_check'},{id:'courses',label:'Cursos',icon:'menu_book'},
    {id:'schedule',label:'Horarios',icon:'schedule'},{id:'grades',label:'Calificaciones',icon:'workspace_premium'},
    {id:'communications',label:'Comunicados',icon:'chat_bubble_outline'},{id:'reports',label:'Reportes',icon:'bar_chart'}
  ];
  private readonly modulePaths: Record<ModuleId, string> = {
    dashboard: 'dashboard', students: 'alumnos', teachers: 'docentes', enrollment: 'matriculas', classrooms: 'grados-secciones', academicCalendar: 'anos-periodos',
    attendance: 'asistencia', courses: 'cursos', schedule: 'horarios', grades: 'calificaciones',
    communications: 'comunicados', reports: 'reportes'
  };
  readonly reportTypes = [
    {id:'academic',label:'Rendimiento académico',description:'Calificaciones por estudiante y curso',icon:'trending_up'},
    {id:'attendance',label:'Asistencia escolar',description:'Presencias, faltas y tardanzas',icon:'groups'},
    {id:'students',label:'Padrón de estudiantes',description:'Estudiantes y apoderados',icon:'badge'},
    {id:'enrollment',label:'Matrículas',description:'Estado de las matrículas por año',icon:'assignment'},
    {id:'teachers',label:'Carga docente',description:'Cursos y horas por docente',icon:'school'}
  ];

  constructor() {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(event => this.activateRoute(event.urlAfterRedirects));
    afterNextRender(() => { void this.restore(); });
  }

  get admin(): boolean { return this.user?.role === 'admin'; }
  get staff(): boolean { return this.user?.role === 'admin' || this.user?.role === 'docente'; }
  get currentLabel(): string { return this.navItems.find(x=>x.id===this.activeModule)?.label ?? ''; }
  get classroom(): Classroom | undefined { return this.classrooms.find(x=>x.id===Number(this.selectedClassroomId)); }
  get classroomLabel(): string { return this.classroom ? this.roomLabel(this.classroom) : 'Selecciona un aula'; }
  get classroomCourses(): Course[] { return this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.selectedClassroomId))); }
  get courseCategories(): string[] { return [...new Set(this.courses.map(c=>c.category))]; }
  get filteredCourses(): Course[] { return this.courses.filter(c=>(!this.categoryFilter||c.category===this.categoryFilter)&&c.name.toLowerCase().includes(this.query.toLowerCase())); }
  get filteredTeachers(): Teacher[] { return this.teachers.filter(t=>t.name.toLowerCase().includes(this.query.toLowerCase())&&(!this.statusFilter||t.status===this.statusFilter)); }
  get visibleMessages(): Communication[] { return this.messages.filter(m=>(!this.messageFilter||m.type===this.messageFilter)&&!!m.readers[0]?.pivot.archived===this.showArchived); }
  get attendanceCounts(): Record<AttendanceState,number> { const counts={P:0,F:0,T:0,J:0}; Object.values(this.attendance).forEach(s=>{if(s) counts[s]++;}); return counts; }
  get selectedGradeCourse(): Course | undefined { return this.classroomCourses.find(c=>c.id===Number(this.selectedCourseId)); }
  get activePeriodLabel(): string { return this.periods.find(p=>p.number===Number(this.period))?.name??'Periodo '+this.period; }
  get invalidScores(): boolean { return Object.values(this.scores).some(score=>!this.validScore(score)); }
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
    const names: Record<Resource,string>={students:'estudiante',teachers:'docente',courses:'curso',enrollments:'matrícula',schedules:'bloque de horario',classrooms:'grado y sección','academic-years':'año académico','academic-periods':'periodo académico',communications:'comunicado',users:'usuario'};
    return (this.editingId?'Editar ':'Registrar ')+(this.modal?names[this.modal]:'');
  }
  get fields(): Field[] {
    const text=(key:string,label:string,required=true,type='text'):Field=>({key,label,required,type});
    const select=(key:string,label:string,options:{value:FormValue;label:string}[],required=true):Field=>({key,label,type:'select',options,required});
    const options=(values:string[])=>values.map(value=>({value,label:value}));
    const userOptions=(role:Role)=>[{value:null,label:'Sin cuenta vinculada'},...this.users.filter(u=>u.role===role&&u.active).map(u=>({value:u.id,label:u.name+' — '+u.email}))];
    const rooms=this.classrooms.map(r=>({value:r.id,label:this.roomLabel(r)}));
    const scheduleCourse=this.courses.find(c=>c.id===Number(this.draft['course_id']));
    switch(this.modal) {
      case 'students': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('birth_date','Fecha de nacimiento',false,'date'),text('guardian','Apoderado'),text('phone','Teléfono'),select('guardian_user_id','Cuenta del apoderado',userOptions('padre'),false),select('status','Estado',options(['Activo','Inactivo','Trasladado']))];
      case 'teachers': return [text('name','Nombres y apellidos'),text('dni','DNI'),text('email','Correo institucional',true,'email'),text('phone','Teléfono',false),select('user_id','Cuenta docente',userOptions('docente'),false),select('status','Estado',options(['Activo','Inactivo']))];
      case 'courses': return [text('name','Nombre del curso'),text('category','Área académica'),{...text('hours','Horas semanales',true,'number'),min:1,max:40},text('description','Descripción',false,'textarea'),text('color','Color',true,'color')];
      case 'enrollments': return [select('student_id','Estudiante',this.enrollmentCandidates.map(s=>({value:s.id,label:s.name}))),select('classroom_id','Grado y sección',rooms),{...text('year','Año académico',true,'number'),min:2020,max:2100},text('enrolled_at','Fecha de matrícula',true,'date'),select('status','Estado',options(['Activo','Pendiente','Cancelado']))];
      case 'schedules': return [select('classroom_id','Aula',rooms),select('course_id','Curso',this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.draft['classroom_id']))).map(c=>({value:c.id,label:c.name}))),select('teacher_id','Docente',scheduleCourse?.teachers.filter(t=>t.status==='Activo').map(t=>({value:t.id,label:t.name}))??[]),select('day','Día',this.days.map((label,i)=>({value:i+1,label}))),text('starts_at','Hora de inicio',true,'time'),text('ends_at','Hora de fin',true,'time')];
      case 'classrooms': return [{...text('year','Año académico',true,'number'),min:2020,max:2100},select('grade','Grado',[1,2,3,4,5,6].map(value=>({value,label:value+'° Grado'}))),text('section','Sección (A, B, C)'),{...text('capacity','Capacidad de estudiantes',true,'number'),min:1,max:100}];
      case 'academic-years': return [{...text('year','Año académico',true,'number'),min:2020,max:2100},text('starts_on','Fecha de inicio',true,'date'),text('ends_on','Fecha de término',true,'date'),select('status','Estado',options(['Planificado','Activo','Cerrado']))];
      case 'academic-periods': return [select('academic_year_id','Año académico',this.academicYears.map(item=>({value:item.id,label:String(item.year)}))),select('number','Número de periodo',[1,2,3,4].map(value=>({value,label:'Periodo '+value}))),text('name','Nombre del periodo'),text('starts_on','Fecha de inicio',true,'date'),text('ends_on','Fecha de término',true,'date'),select('status','Estado',options(['Planificado','Activo','Cerrado']))];
      case 'communications': return [select('type','Tipo',options(['Comunicado','Circular','Urgente'])),text('subject','Asunto'),select('audience','Destinatarios',this.admin?[{value:'all',label:'Toda la comunidad'},{value:'docente',label:'Docentes'},{value:'padre',label:'Apoderados'},{value:'admin',label:'Administración'}]:[{value:'padre',label:'Apoderados del aula'},{value:'all',label:'Comunidad del aula'}]),select('classroom_id','Aula',this.admin?[{value:null,label:'Todas las aulas'},...rooms]:rooms,!this.admin),text('body','Mensaje',true,'textarea')];
      case 'users': return [text('name','Nombre completo'),text('email','Correo',true,'email'),select('role','Perfil',this.loginRoles.map(value=>({value,label:this.roleInfo[value].label}))),text('password','Contraseña inicial (mínimo 10 caracteres)',true,'password')];
      default:return [];
    }
  }

  private async run(work:()=>Promise<void>, success=''): Promise<void> {
    if(this.busy) return;
    this.busy=true;this.error='';this.notice='';this.cdr.markForCheck();
    try { await work(); if(success) this.notice=success; }
    catch(error) { this.error=error instanceof Error?error.message:'No se pudo completar la operación.'; if(error instanceof ApiError&&error.status===401){this.authenticated=false;this.user=null;} }
    finally {
      this.busy=false;this.cdr.markForCheck();
      if(this.pendingRouteLoad){this.pendingRouteLoad=false;void this.run(()=>this.loadModule());}
    }
  }

  async restore(): Promise<void> {
    try {
      await this.api.csrf();
      const response=await this.api.request<{user:User}>('default-admin','POST');
      this.user=response.user;this.selectedRole=response.user.role;this.authenticated=true;
      await this.bootstrap(true);await this.loadModule();
    } catch(error) { this.error=error instanceof Error?error.message:'No se pudo iniciar el acceso administrativo.'; }
    finally {this.restoring=false;this.cdr.markForCheck();}
  }
  private async bootstrap(resetDefaults=false): Promise<void> {
    const data=await this.api.request<Bootstrap>('bootstrap'+(resetDefaults?'':'?year='+this.year));
    this.user=data.user;this.selectedRole=data.user.role;this.settings=data.settings;this.years=data.years;this.periods=data.periods;
    this.year=data.year;
    if(!this.years.includes(this.year)) this.years=[this.year,...this.years];
    if(resetDefaults) this.period=data.settings.period;
    if(!this.periods.some(p=>p.number===Number(this.period))) this.period=this.periods.find(p=>p.status==='Activo')?.number??this.periods[0]?.number??1;
    this.classrooms=data.classrooms;this.courses=data.courses;this.teachers=data.teachers;this.summary=data.dashboard;
    if(!this.classrooms.some(c=>c.id===Number(this.selectedClassroomId))) this.selectedClassroomId=this.classrooms.find(c=>c.grade===5&&c.section==='A')?.id??this.classrooms[0]?.id??0;
    this.selectDefaultCourse();
  }
  private selectDefaultCourse():void { if(!this.classroomCourses.some(c=>c.id===Number(this.selectedCourseId))) this.selectedCourseId=this.classroomCourses[0]?.id??0; }
  refresh(): void {void this.run(async()=>{await this.bootstrap();await this.loadModule();});}
  changeYear():void {this.page=1;this.refresh();}
  selectModule(module:ModuleId):void {
    if(this.busy) return;
    void this.router.navigate(['/', this.modulePaths[module]]);
  }
  searchSystem():void {
    if(this.busy)return;
    this.query=this.search;this.page=1;
    if(this.activeModule==='students') void this.run(()=>this.loadModule());
    else {this.pendingStudentSearch=this.search;void this.router.navigate(['/alumnos']);}
  }
  filter():void {this.page=1;void this.run(()=>this.loadModule());}
  paginate(page:number):void {if(page<1||page>this.lastPage)return;this.page=page;void this.run(()=>this.loadModule());}
  changeClassroom():void {this.selectDefaultCourse();void this.run(()=>this.loadModule());}
  changePeriod():void {void this.run(()=>this.loadModule());}
  changeAcademicYear():void {void this.run(()=>this.loadAcademicPeriods());}
  private async loadAcademicPeriods():Promise<void> {
    this.academicPeriods=this.selectedAcademicYearId?await this.api.all<AcademicPeriod>('academic-periods?academic_year_id='+this.selectedAcademicYearId):[];
  }
  private async loadModule():Promise<void> {
    const params='?page='+this.page+'&per_page=8&q='+encodeURIComponent(this.query)+'&status='+encodeURIComponent(this.statusFilter);
    switch(this.activeModule) {
      case 'dashboard': this.summary=(await this.api.request<{data:Summary}>('dashboard?year='+this.year+'&period='+this.period)).data;break;
      case 'students': {const r=await this.api.request<Page<Student>>('students'+params);this.students=r.data;this.applyPage(r);break;}
      case 'enrollment': {const r=await this.api.request<Page<Enrollment>>('enrollments'+params+'&year='+this.year);this.enrollments=r.data;this.applyPage(r);break;}
      case 'classrooms': {const r=await this.api.request<Page<Classroom>>('classrooms'+params+'&year='+this.year+(this.gradeFilter?'&grade='+this.gradeFilter:''));this.classroomRows=r.data;this.applyPage(r);break;}
      case 'academicCalendar':
        this.academicYears=await this.api.all<AcademicYear>('academic-years');
        if(!this.academicYears.some(item=>item.id===Number(this.selectedAcademicYearId))) this.selectedAcademicYearId=this.academicYears.find(item=>item.year===Number(this.year))?.id??this.academicYears[0]?.id??0;
        await this.loadAcademicPeriods();break;
      case 'attendance':
        this.attendanceRows=this.selectedClassroomId?(await this.api.request<{data:Enrollment[]}>('attendance?classroom_id='+this.selectedClassroomId+'&date='+this.date)).data:[];
        this.attendance=Object.fromEntries(this.attendanceRows.map(e=>[e.id,e.attendances?.[0]?.status??'']));break;
      case 'grades':
        this.gradeRows=this.selectedClassroomId?(await this.api.request<{data:Enrollment[]}>('grades?classroom_id='+this.selectedClassroomId+'&period='+this.period)).data:[];
        this.updateScores();break;
      case 'schedule': this.schedules=this.selectedClassroomId?await this.api.all<Schedule>('schedules?classroom_id='+this.selectedClassroomId):[];break;
      case 'communications':
        this.messages=await this.api.all<Communication>('communications?q='+encodeURIComponent(this.query));
        this.messages.sort((a,b)=>b.id-a.id);this.selectedMessage=this.messages.find(m=>m.id===this.selectedMessage?.id)??this.visibleMessages[0]??null;break;
      case 'reports':this.report=(await this.api.request<{data:Report}>('reports?type='+this.reportType+'&year='+this.year+'&period='+this.period)).data;break;
    }
  }
  private activateRoute(url:string):void {
    const path=url.split(/[?#]/,1)[0].replace(/^\/+|\/+$/g,'');
    const module=(Object.entries(this.modulePaths).find(([,route])=>route===path)?.[0] ?? 'dashboard') as ModuleId;
    if(this.activeModule===module) return;
    this.activeModule=module;this.mobileOpen=false;this.profileOpen=false;
    this.query=module==='students'&&this.pendingStudentSearch!==null?this.pendingStudentSearch:'';
    this.pendingStudentSearch=null;this.statusFilter='';this.gradeFilter=0;this.page=1;
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
  markAll(state:AttendanceState):void {this.attendance=Object.fromEntries(this.attendanceRows.map(e=>[e.id,state]));}
  saveAttendance():void {void this.run(async()=>{
    const records=this.attendanceRows.map(e=>({enrollment_id:e.id,status:this.attendance[e.id]}));
    if(records.some(r=>!r.status)) throw new Error('Marca la asistencia de todos los estudiantes antes de guardar.');
    await this.api.request('attendance','PUT',{classroom_id:this.selectedClassroomId,date:this.date,records});
    await this.loadModule();await this.bootstrap();
  },'Asistencia guardada en la base de datos.');}
  saveGrades():void {void this.run(async()=>{
    if(this.invalidScores) throw new Error('Las calificaciones deben estar entre 0 y 20.');
    const records=this.gradeRows.map(e=>({enrollment_id:e.id,score:this.scores[e.id]===null?null:Number(this.scores[e.id])}));
    if(!records.length) throw new Error('No hay estudiantes para calificar.');
    await this.api.request('grades','PUT',{classroom_id:this.selectedClassroomId,course_id:this.selectedCourseId,period:this.period,records});
    await this.loadModule();await this.bootstrap();
  },'Calificaciones guardadas.');}
  async openModal(resource:Resource, record?:object):Promise<void> {
    await this.run(async()=>{
      if(this.admin&&(resource==='students'||resource==='teachers'||resource==='users')) this.users=(await this.api.request<{data:User[]}>('users')).data;
      if(resource==='enrollments') this.enrollmentCandidates=await this.api.all<Student>('students');
      this.editingId=record&&'id' in record?Number(record.id):null;
      this.draft={name:'',dni:'',email:'',phone:'',guardian:'',guardian_user_id:null,user_id:null,status:'Activo',color:'#3b82f6',soft:'#eff6ff',hours:4,teacher_id:null,classroom_id:this.selectedClassroomId||null,student_id:null,year:this.year,enrolled_at:this.date,grade:1,section:'A',capacity:30,day:1,starts_at:'07:30',ends_at:'08:15',course_id:this.classroomCourses[0]?.id??null,type:'Comunicado',subject:'',body:'',audience:this.admin?'all':'padre',draft:false,role:'docente',password:''};
      if(resource==='academic-years') this.draft={year:new Date().getFullYear()+1,starts_on:(new Date().getFullYear()+1)+'-03-01',ends_on:(new Date().getFullYear()+1)+'-12-20',status:'Planificado'};
      if(resource==='academic-periods') {
        const academicYearId=this.selectedAcademicYearId||this.academicYears[0]?.id||0;
        const used=this.academicPeriods.map(item=>item.number);
        const number=[1,2,3,4].find(item=>!used.includes(item))??1;
        this.draft={academic_year_id:academicYearId,number,name:'Bimestre '+number,status:'Planificado',...this.periodDateDefaults(academicYearId,number)};
      }
      if(record) for(const [key,value] of Object.entries(record)) if(value===null||['string','number','boolean'].includes(typeof value)) this.draft[key]=value as FormValue;
      if(resource==='schedules'){this.draft['starts_at']=String(this.draft['starts_at']).slice(0,5);this.draft['ends_at']=String(this.draft['ends_at']).slice(0,5);this.syncScheduleFields();}
      this.selectedRoomIds=resource==='courses'&&record?(record as Course).classrooms.map(r=>r.id):this.classrooms.map(r=>r.id);
      this.selectedTeacherCourseIds=resource==='teachers'&&record?((record as Teacher).courses??[]).map(c=>c.id):[];
      this.selectedCourseTeacherIds=resource==='courses'&&record?(record as Course).teachers.map(t=>t.id):this.teachers.filter(t=>t.status==='Activo').slice(0,1).map(t=>t.id);
      this.modal=resource;
    });
  }
  toggleRoom(id:number):void {this.selectedRoomIds=this.selectedRoomIds.includes(id)?this.selectedRoomIds.filter(v=>v!==id):[...this.selectedRoomIds,id];}
  toggleTeacherCourse(id:number):void {this.selectedTeacherCourseIds=this.selectedTeacherCourseIds.includes(id)?this.selectedTeacherCourseIds.filter(v=>v!==id):[...this.selectedTeacherCourseIds,id];}
  toggleCourseTeacher(id:number):void {this.selectedCourseTeacherIds=this.selectedCourseTeacherIds.includes(id)?this.selectedCourseTeacherIds.filter(v=>v!==id):[...this.selectedCourseTeacherIds,id];}
  fieldChanged(key:string):void {
    if(this.modal==='schedules'&&(key==='classroom_id'||key==='course_id'))this.syncScheduleFields();
    if(this.modal==='academic-periods'&&!this.editingId&&(key==='academic_year_id'||key==='number')) {
      const academicYearId=Number(this.draft['academic_year_id']);const number=Number(this.draft['number']);
      this.draft={...this.draft,name:'Bimestre '+number,...this.periodDateDefaults(academicYearId,number)};
    }
  }
  private periodDateDefaults(academicYearId:number,number:number):{starts_on:string;ends_on:string} {
    const academicYear=this.academicYears.find(item=>item.id===academicYearId);
    if(!academicYear)return {starts_on:'',ends_on:''};
    const start=new Date(academicYear.starts_on+'T00:00:00');const end=new Date(academicYear.ends_on+'T00:00:00');
    const days=Math.floor((end.getTime()-start.getTime())/86400000)+1;
    const startsOn=new Date(start.getTime()+Math.floor(days*(number-1)/4)*86400000);
    const endsOn=new Date(start.getTime()+(Math.floor(days*number/4)-1)*86400000);
    const format=(value:Date)=>value.toLocaleDateString('en-CA');
    return {starts_on:format(startsOn),ends_on:format(endsOn)};
  }
  private syncScheduleFields():void {
    const available=this.courses.filter(c=>c.classrooms.some(r=>r.id===Number(this.draft['classroom_id'])));
    if(!available.some(c=>c.id===Number(this.draft['course_id'])))this.draft['course_id']=available[0]?.id??null;
    const course=this.courses.find(c=>c.id===Number(this.draft['course_id']));
    if(!course?.teachers.some(t=>t.id===Number(this.draft['teacher_id'])&&t.status==='Activo'))this.draft['teacher_id']=course?.teachers.find(t=>t.status==='Activo')?.id??null;
  }
  closeModal():void {if(!this.busy){this.modal=null;this.error='';}}
  saveModal(draft=false):void {void this.run(async()=>{
    if(!this.modal) return;
    const resource=this.modal;
    const body:Record<string,unknown>={};
    this.fields.forEach(f=>{body[f.key]=this.draft[f.key]===''&&!f.required?null:this.draft[f.key];});
    if(resource==='courses'){body['classroom_ids']=this.selectedRoomIds;body['teacher_ids']=this.selectedCourseTeacherIds;body['soft']=this.draft['soft'];}
    if(resource==='teachers') body['course_ids']=this.selectedTeacherCourseIds;
    if(resource==='communications') body['draft']=draft;
    await this.api.request(resource+(this.editingId?'/'+this.editingId:''),this.editingId?'PUT':'POST',body);
    if(resource==='classrooms') this.year=Number(body['year']);
    if(resource==='academic-years'&&body['status']==='Activo') this.year=Number(body['year']);
    if(resource==='academic-periods'&&body['status']==='Activo') {
      this.period=Number(body['number']);
      this.year=this.academicYears.find(item=>item.id===Number(body['academic_year_id']))?.year??this.year;
    }
    this.modal=null;
    if(resource==='users') this.users=(await this.api.request<{data:User[]}>('users')).data;
    await this.bootstrap();await this.loadModule();
  },'Registro guardado.');}
  deleteRecord():void {void this.run(async()=>{
    if(!this.confirmDelete)return;
    await this.api.request(this.confirmDelete.resource+'/'+this.confirmDelete.id,'DELETE');
    this.confirmDelete=null;await this.bootstrap();await this.loadModule();
  },'Registro eliminado.');}
  readMessage(message:Communication):void {this.selectedMessage=message; if(message.draft)return;void this.run(async()=>{
    await this.api.request('communications/'+message.id+'/receipt','PUT',{});await this.loadModule();await this.bootstrap();
  });}
  archiveMessage():void {if(!this.selectedMessage)return;const id=this.selectedMessage.id;void this.run(async()=>{
    await this.api.request('communications/'+id+'/receipt','PUT',{archived:!this.showArchived});await this.loadModule();this.selectedMessage=this.visibleMessages[0]??null;
  },'Comunicado actualizado.');}
  chooseReport(type:string):void {this.reportType=type;void this.run(()=>this.loadModule());}
  exportReport():void {void this.run(()=>this.api.download('reports/export?type='+this.reportType+'&year='+this.year+'&period='+this.period,'reporte-'+this.reportType+'-'+this.year+'.csv'));}
  print():void {window.print();}
  openSettings():void {void this.run(async()=>{
    if(this.admin)this.users=(await this.api.request<{data:User[]}>('users')).data;
    this.settingsOpen=true;
  });}
  saveSettings():void {void this.run(async()=>{
    await this.api.request('settings','PUT',this.settings);this.year=Number(this.settings.year);await this.bootstrap();await this.loadModule();
  },'Configuración guardada.');}
  savePassword():void {void this.run(async()=>{
    await this.api.request('password','PUT',this.passwordForm);this.passwordForm={current_password:'',password:'',password_confirmation:''};
  },'Contraseña actualizada.');}
  toggleUser(u:User):void {void this.run(async()=>{
    await this.api.request('users/'+u.id,'PUT',{active:!u.active});this.users=(await this.api.request<{data:User[]}>('users')).data;
  },'Usuario actualizado.');}
  initials(name:string):string {return name.replace(/^Prof\. /,'').split(' ').filter(Boolean).slice(0,2).map(n=>n[0]).join('');}
  audienceLabel(audience:string):string {return audience==='admin'?'Administración':audience==='docente'?'Docentes':audience==='padre'?'Apoderados':'Comunidad educativa';}
  roomLabel(room:Classroom):string {return room.grade+'° — Sec. '+room.section;}
  classroomCourseNames(room:Classroom):string {return this.courses.filter(course=>course.classrooms.some(item=>item.id===room.id)).map(course=>course.name).join(', ');}
  studentEnrollment(s:Student):Enrollment|undefined {return s.enrollments?.find(e=>e.year===Number(this.year));}
  courseGrades(course:Course):string {return [...new Set(course.classrooms.filter(r=>r.year===Number(this.year)).map(r=>r.grade))].sort().map(g=>g+'°').join(', ');}
  teacherHours(teacher:Teacher):number {return (teacher.courses??[]).reduce((s,c)=>s+c.hours,0);}
  teacherCourseNames(teacher:Teacher):string {return (teacher.courses??[]).map(c=>c.name).join(', ');}
  courseTeacherNames(course:Course):string {return course.teachers.map(t=>t.name).join(', ');}
  teacherGrades(teacher:Teacher):string {return [...new Set((teacher.courses??[]).flatMap(c=>c.classrooms.filter(r=>r.year===Number(this.year)).map(r=>r.grade)))].sort().map(g=>g+'°').join(', ');}
  unread(message:Communication):boolean {return !message.draft&&!message.readers[0]?.pivot.read_at;}
  scheduleFor(day:number):Schedule[] {return this.schedules.filter(s=>s.day===day).sort((a,b)=>a.starts_at.localeCompare(b.starts_at));}
  gradeValue(e:Enrollment,courseId:number):number|null {return e.grades?.find(g=>g.course_id===courseId)?.score??null;}
  displayedGrade(e:Enrollment,courseId:number):number|null {return this.staff&&courseId===Number(this.selectedCourseId)?this.scores[e.id]??null:this.gradeValue(e,courseId);}
  averageValue(e:Enrollment):number|null {
    const values=this.classroomCourses.map(c=>this.displayedGrade(e,c.id)).filter((score):score is number=>score!==null&&Number.isFinite(Number(score))).map(Number);
    return values.length?values.reduce((sum,score)=>sum+score,0)/values.length:null;
  }
  average(e:Enrollment):string {const value=this.averageValue(e);return value===null?'—':value.toFixed(1);}
  weeklyPoints(absent=false):string {return this.summary.weekly.map((w,i)=>{const x=35+i*930/Math.max(this.summary.weekly.length-1,1);const percent=w.total?100*(absent?w.absent:w.present)/w.total:0;return x+','+(230-percent*2);}).join(' ');}
  closeOnboarding():void {this.onboardingOpen=false;this.onboardingStep=0;}
  nextOnboarding():void {if(this.onboardingStep<2)this.onboardingStep++;else this.closeOnboarding();}
}
