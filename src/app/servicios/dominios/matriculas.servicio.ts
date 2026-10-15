import { inject, Injectable } from '@angular/core';
import { Estudiante, Matricula, Pagina } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

export interface FiltrosMatriculas {
  pagina: number; busqueda: string; estado: string; anio: number; grado: number; aulaId: number | null;
}

@Injectable({ providedIn: 'root' })
export class MatriculasServicio {
  private readonly api = inject(ApiAcademicaServicio);

  listar(filtros: FiltrosMatriculas): Promise<Pagina<Matricula>> {
    const query = new URLSearchParams({page:String(filtros.pagina),per_page:'8',q:filtros.busqueda,status:filtros.estado,year:String(filtros.anio)});
    if(filtros.grado)query.set('grade',String(filtros.grado));
    if(filtros.aulaId)query.set('classroom_id',String(filtros.aulaId));
    return this.api.solicitar<Pagina<Matricula>>(`enrollments?${query}`);
  }

  async candidatos(anio:number):Promise<Estudiante[]> {
    return (await this.api.solicitar<{data:Estudiante[]}>(`enrollment-candidates?year=${anio}`)).data;
  }

  actualizarEstado(id:number,activo:boolean):Promise<unknown> {
    return this.api.solicitar(`enrollments/${id}/activation`,'PUT',{active:activo});
  }
}
