import { Injectable, inject } from '@angular/core';
import { Report } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

export interface FiltrosReporte {
  type: string;
  year: number;
  period: number;
  grade: number;
  classroom_id: number | null;
  q: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesServicio {
  private readonly api = inject(ApiAcademicaServicio);

  private ruta(filtros: FiltrosReporte): string {
    const parametros = new URLSearchParams({
      type: filtros.type,
      year: String(filtros.year),
      period: String(filtros.period),
    });
    if (filtros.grade) parametros.set('grade', String(filtros.grade));
    if (filtros.classroom_id) parametros.set('classroom_id', String(filtros.classroom_id));
    if (filtros.q.trim()) parametros.set('q', filtros.q.trim());
    return parametros.toString();
  }

  async consultar(filtros: FiltrosReporte): Promise<Report> {
    const respuesta = await this.api.solicitar<{ data: Report }>(`reports?${this.ruta(filtros)}`);
    return respuesta.data;
  }

  descargar(filtros: FiltrosReporte): Promise<void> {
    const nombre = `reporte-${filtros.type}-${filtros.year}.csv`;
    return this.api.descargar(`reports/export?${this.ruta(filtros)}`, nombre);
  }
}
