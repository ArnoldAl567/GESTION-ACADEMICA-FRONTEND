import { inject, Injectable } from '@angular/core';
import { EstadoAsistencia, Matricula } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

@Injectable({ providedIn: 'root' })
export class AsistenciaServicio {
  private readonly api = inject(ApiAcademicaServicio);

  async listar(aulaId:number,fecha:string):Promise<Matricula[]> {
    if(!aulaId)return [];
    return (await this.api.solicitar<{data:Matricula[]}>(`attendance?classroom_id=${aulaId}&date=${fecha}`)).data;
  }

  guardar(aulaId:number,fecha:string,registros:{enrollment_id:number;status:EstadoAsistencia}[]):Promise<unknown> {
    return this.api.solicitar('attendance','PUT',{classroom_id:aulaId,date:fecha,records:registros});
  }
}
