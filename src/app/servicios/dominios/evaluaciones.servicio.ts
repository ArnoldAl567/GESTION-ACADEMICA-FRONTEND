import { inject, Injectable } from '@angular/core';
import { Evaluacion, Matricula } from '../../modelos/academicos.modelos';
import { ApiAcademicaServicio } from '../api-academica.servicio';

@Injectable({ providedIn: 'root' })
export class EvaluacionesServicio {
  private readonly api = inject(ApiAcademicaServicio);

  listar(aulaId:number,periodoId:number):Promise<Evaluacion[]> {
    if(!aulaId||!periodoId)return Promise.resolve([]);
    return this.api.listarTodos<Evaluacion>(`management/evaluations?classroom_id=${aulaId}&academic_period_id=${periodoId}`);
  }

  async matriculas(aulaId:number,periodo:number):Promise<Matricula[]> {
    return (await this.api.solicitar<{data:Matricula[]}>(`grades?classroom_id=${aulaId}&period=${periodo}`)).data;
  }

  guardarNotas(evaluacionId:number,registros:unknown[]):Promise<unknown> {
    return this.api.solicitar(`evaluations/${evaluacionId}/scores`,'PUT',{records:registros});
  }
}
