import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, timeout } from 'rxjs/operators';
import { environment } from '../config/environment.config';

export interface BackendStatus {
  isOnline: boolean;
  responseTime: number;
  error?: string;
  version?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BackendTestUtil {
  private readonly healthCheckUrl = `${environment.apiUrl}/health`;
  private readonly timeoutMs = 5000; // 5 segundos

  constructor(private http: HttpClient) {}

  /**
   * Verifica si el backend está disponible
   */
  checkBackendHealth(): Observable<BackendStatus> {
    const startTime = Date.now();

    return this.http.get<any>(this.healthCheckUrl).pipe(
      timeout(this.timeoutMs),
      map((response) => ({
        isOnline: true,
        responseTime: Date.now() - startTime,
        version: response?.version || 'unknown'
      })),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        let errorMessage = 'Backend no disponible';

        if (error.name === 'TimeoutError') {
          errorMessage = 'Timeout - El backend no responde';
        } else if (error.status === 0) {
          errorMessage = 'No se puede conectar al backend';
        } else {
          errorMessage = `Error ${error.status}: ${error.message}`;
        }

        return of({
          isOnline: false,
          responseTime,
          error: errorMessage
        });
      })
    );
  }

  /**
   * Test básico de conectividad con endpoint de cursos
   */
  testCoursesEndpoint(): Observable<boolean> {
    return this.http.get<any>(`${environment.apiUrl}${environment.endpoints.courses}`).pipe(
      timeout(this.timeoutMs),
      map(() => true),
      catchError(() => of(false))
    );
  }

  /**
   * Obtiene información del estado del backend
   */
  getBackendInfo(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/info`).pipe(
      timeout(this.timeoutMs),
      catchError(() => of({ 
        name: 'Course API',
        status: 'unknown'
      }))
    );
  }
}