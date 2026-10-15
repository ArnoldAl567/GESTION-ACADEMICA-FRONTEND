import { Injectable } from '@angular/core';
import { Pagina } from '../modelos/academicos.modelos';

export class ErrorApi extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class ApiAcademicaServicio {
  private tokenCsrf = '';
  private readonly rutaBase = '/api/v1';

  async prepararCsrf(): Promise<void> {
    const data = await this.solicitar<{ csrf_token: string }>('csrf');
    this.tokenCsrf = data.csrf_token;
  }

  async solicitar<T>(ruta: string, metodo = 'GET', cuerpo?: unknown): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20_000);

    try {
      const response = await fetch(`${this.rutaBase}/${ruta}`, {
        method: metodo,
        credentials: 'same-origin',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...(metodo === 'GET' ? {} : { 'X-CSRF-TOKEN': this.tokenCsrf }),
        },
        ...(cuerpo === undefined ? {} : { body: JSON.stringify(cuerpo) }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const details = data.errors ? Object.values(data.errors).flat().join(' ') : data.message;
        const message = response.status >= 500
          ? 'No se pudo completar la operación. Comprueba que Laravel y PostgreSQL estén disponibles.'
          : (details || 'No se pudo completar la solicitud.');
        throw new ErrorApi(message, response.status);
      }

      if (data.csrf_token) {
        this.tokenCsrf = data.csrf_token;
      }

      return data as T;
    } catch (error) {
      if (error instanceof ErrorApi) {
        throw error;
      }
      throw new ErrorApi('No hay conexión con el servidor. Comprueba que el backend esté iniciado e inténtalo de nuevo.', 0);
    } finally {
      clearTimeout(timeout);
    }
  }

  async listarTodos<T>(recurso: string): Promise<T[]> {
    const registros: T[] = [];
    let pagina = 1;
    let ultimaPagina = 1;

    do {
      const separador = recurso.includes('?') ? '&' : '?';
      const response = await this.solicitar<Pagina<T>>(`${recurso}${separador}per_page=100&page=${pagina}`);
      registros.push(...response.data);
      ultimaPagina = response.last_page;
      pagina++;
    } while (pagina <= ultimaPagina);

    return registros;
  }

  async descargar(ruta: string, nombreArchivo: string): Promise<void> {
    const response = await fetch(`${this.rutaBase}/${ruta}`, {
      credentials: 'same-origin',
      headers: { Accept: '*/*' },
    });
    if (!response.ok) {
      throw new ErrorApi('No se pudo descargar el archivo.', response.status);
    }

    const url = URL.createObjectURL(await response.blob());
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1_000);
  }
}
