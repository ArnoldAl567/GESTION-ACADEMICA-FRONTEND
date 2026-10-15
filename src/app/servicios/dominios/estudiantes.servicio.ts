import { inject, Injectable } from '@angular/core';
import { Pagina, Estudiante, DocumentoEstudiante } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

export interface FiltrosEstudiantes {
  pagina: number;
  busqueda: string;
  estado: string;
  anio: number;
  grado: number;
  aulaId: number | null;
}

@Injectable({ providedIn: 'root' })
export class EstudiantesServicio {
  private readonly api = inject(ApiAcademicaServicio);

  async listar(filtros: FiltrosEstudiantes): Promise<{ pagina: Pagina<Estudiante>; documentos: DocumentoEstudiante[] }> {
    const query = new URLSearchParams({
      page: String(filtros.pagina), per_page: '8', q: filtros.busqueda,
      status: filtros.estado, year: String(filtros.anio),
    });
    if (filtros.grado) query.set('grade', String(filtros.grado));
    if (filtros.aulaId) query.set('classroom_id', String(filtros.aulaId));
    const [pagina, documentos] = await Promise.all([
      this.api.solicitar<Pagina<Estudiante>>(`students?${query}`),
      this.api.listarTodos<DocumentoEstudiante>('management/student-documents'),
    ]);
    return { pagina, documentos };
  }
}
