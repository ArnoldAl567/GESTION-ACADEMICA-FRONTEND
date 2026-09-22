import { Injectable } from '@angular/core';

export type Role = 'admin' | 'docente' | 'padre';
export interface User { id: number; name: string; email: string; role: Role; active: boolean; }
export interface Classroom { id: number; year: number; grade: number; section: string; capacity: number; enrollments_count?: number; courses_count?: number; }
export interface Student { id: number; name: string; dni: string; guardian: string; guardian_user_id: number | null; phone: string; status: string; color: string; birth_date?: string; enrollments?: Enrollment[]; }
export interface Teacher { id: number; name: string; dni: string; email: string; phone: string; status: string; color: string; user_id: number | null; courses?: Course[]; }
export interface Course { id: number; name: string; category: string; description: string; teachers: Teacher[]; hours: number; color: string; soft: string; classrooms: Classroom[]; }
export interface Enrollment { id: number; student_id: number; classroom_id: number; year: number; enrolled_at: string; status: string; student: Student; classroom: Classroom; attendances?: Attendance[]; grades?: Grade[]; }
export interface Attendance { enrollment_id: number; date: string; status: AttendanceState; notes?: string; }
export type AttendanceState = 'P' | 'F' | 'T' | 'J';
export interface Grade { enrollment_id: number; course_id: number; period: number; score: number; }
export interface Schedule { id: number; classroom_id: number; course_id: number; day: number; starts_at: string; ends_at: string; course: Course; teacher: Teacher; }
export interface Communication { id: number; type: string; subject: string; body: string; audience: string; classroom_id: number | null; draft: boolean; published_at: string | null; author_id: number; author: User; readers: (User & { pivot: { read_at: string | null; archived: boolean } })[]; }
export interface Summary { students: number; teachers: number; enrollments: number; pending: number; cancelled: number; attendance: number; average: number; unread: number; distribution: {grade: number; total: number}[]; performance: {grade: number; average: number}[]; weekly: {date: string; present: number; absent: number; total: number}[]; trend: {month: string; total: number}[]; alerts: {student: string; average: number | null; attendance: number | null; classroom: string}[]; activity: {description: string; date: string}[]; }
export interface Settings { name: string; year: number; period: number; }
export interface AcademicYear { id: number; year: number; starts_on: string; ends_on: string; status: string; periods_count?: number; }
export interface AcademicPeriod { id: number; academic_year_id: number; number: number; name: string; starts_on: string; ends_on: string; status: string; academic_year?: AcademicYear; }
export interface Bootstrap { user: User; settings: Settings; year: number; years: number[]; periods: AcademicPeriod[]; classrooms: Classroom[]; teachers: Teacher[]; courses: Course[]; dashboard: Summary; }
export interface Page<T> { data: T[]; total: number; current_page: number; last_page: number; from: number | null; to: number | null; }
export interface Report { columns: string[]; rows: (string | number | null)[][]; summary: Summary; type: string; year: number; period: number; }
export class ApiError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

@Injectable({ providedIn: 'root' })
export class AcademicApi {
  private csrfToken = '';
  readonly base = '/api/v1';

  async csrf(): Promise<void> {
    const data = await this.request<{ csrf_token: string }>('csrf');
    this.csrfToken = data.csrf_token;
  }

  async request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(this.base + '/' + path, {
        method, credentials: 'same-origin', signal: controller.signal,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(method === 'GET' ? {} : { 'X-CSRF-TOKEN': this.csrfToken }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const details = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
        throw new ApiError(response.status >= 500 ? 'No se pudo completar la operación. Comprueba que Laravel y PostgreSQL estén disponibles.' : (details || 'No se pudo completar la solicitud.'), response.status);
      }
      if (data.csrf_token) this.csrfToken = data.csrf_token;
      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError('No hay conexión con el servidor. Comprueba que el backend esté iniciado e inténtalo de nuevo.', 0);
    } finally { clearTimeout(timeout); }
  }

  async all<T>(resource: string): Promise<T[]> {
    const records: T[] = [];
    let page = 1;
    let last = 1;
    do {
      const response = await this.request<Page<T>>(resource + (resource.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
      records.push(...response.data);
      last = response.last_page;
      page++;
    } while (page <= last);
    return records;
  }

  async download(path: string, filename: string): Promise<void> {
    const response = await fetch(this.base + '/' + path, {credentials: 'same-origin', headers: {Accept: 'text/csv'}});
    if (!response.ok) throw new ApiError('No se pudo descargar el reporte.', response.status);
    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url; link.download = filename; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
