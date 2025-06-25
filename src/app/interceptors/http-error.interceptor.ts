import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Agregar headers comunes
    const modifiedReq = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    return next.handle(modifiedReq).pipe(
      retry(1), // Reintentar una vez en caso de error
      catchError((error: HttpErrorResponse) => {
        let errorMessage = '';

        if (error.error instanceof ErrorEvent) {
          // Error del lado del cliente
          errorMessage = `Error del cliente: ${error.error.message}`;
        } else {
          // Error del lado del servidor
          switch (error.status) {
            case 400:
              errorMessage = 'Solicitud incorrecta. Verifique los datos enviados.';
              break;
            case 401:
              errorMessage = 'No autorizado. Verifique sus credenciales.';
              break;
            case 403:
              errorMessage = 'Acceso prohibido.';
              break;
            case 404:
              errorMessage = 'Recurso no encontrado.';
              break;
            case 500:
              errorMessage = 'Error interno del servidor.';
              break;
            case 503:
              errorMessage = 'Servicio no disponible temporalmente.';
              break;
            default:
              errorMessage = `Error del servidor: ${error.status} - ${error.message}`;
          }
        }

        console.error('Error HTTP:', errorMessage);
        return throwError(() => new Error(errorMessage));
      })
    );
  }
}
