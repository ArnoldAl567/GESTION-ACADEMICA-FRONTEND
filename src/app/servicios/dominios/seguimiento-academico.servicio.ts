import { inject, Injectable } from '@angular/core';
import { LibretaAcademica } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

@Injectable({ providedIn: 'root' })
export class SeguimientoAcademicoServicio {
  private readonly api = inject(ApiAcademicaServicio);

  async obtenerLibretas(aulaId:number,periodoId:number):Promise<LibretaAcademica[]> {
    if(!aulaId||!periodoId)return [];
    return (await this.api.solicitar<{data:LibretaAcademica[]}>(`report-cards?classroom_id=${aulaId}&academic_period_id=${periodoId}`)).data;
  }

  descargarLibreta(matriculaId:number,periodoId:number,nombre:string):Promise<void> {
    return this.api.descargar(`report-cards/${matriculaId}/pdf?academic_period_id=${periodoId}`,nombre);
  }
}
