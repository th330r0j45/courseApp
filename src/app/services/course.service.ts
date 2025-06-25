import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Course, CourseResponse, CreateCourseRequest, UpdateCourseRequest } from '../models/course.model';
import { environment } from '../config/environment.config';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private readonly apiUrl = `${environment.apiUrl}`;
  private coursesSubject = new BehaviorSubject<Course[]>([]);
  public courses$ = this.coursesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Método para mapear respuesta del backend a modelo del frontend
  private mapBackendToFrontend(backendCourse: any): Course {
    return {
      id: backendCourse.id,
      title: backendCourse.title, // El nuevo backend ya devuelve 'title'
      description: backendCourse.description,
      instructor: backendCourse.instructor,
      duration: backendCourse.duration, // Ya viene como número
      level: backendCourse.level as 'Principiante' | 'Intermedio' | 'Avanzado',
      price: backendCourse.price,
      imageUrl: backendCourse.imageUrl,
      category: backendCourse.category,
      rating: backendCourse.rating,
      studentsCount: backendCourse.studentsCount,
      isActive: backendCourse.isActive,
      createdAt: new Date(backendCourse.createdAt),
      updatedAt: new Date(backendCourse.updatedAt)
    };
  }

  // Método auxiliar para parsear duración (no necesario con el nuevo backend)
  // Removido - el nuevo backend ya devuelve números

  // Métodos auxiliares removidos - el nuevo backend devuelve todos los campos completos

  // Método para mapear modelo del frontend a request del backend
  private mapFrontendToBackend(course: CreateCourseRequest | UpdateCourseRequest): any {
    return {
      title: (course as any).title || course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      price: course.price,
      imageUrl: course.imageUrl,
      category: course.category,
      rating: (course as any).rating || 0.0,
      studentsCount: (course as any).studentsCount || 0
    };
  }

  // Método para manejar errores HTTP
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Ha ocurrido un error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // GET /api/courses - Obtener todos los cursos
  getAllCourses(page: number = 1, limit: number = 10, category?: string): Observable<CourseResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (category) {
      params = params.set('category', category);
    }
    
    return this.http.get<any>(this.apiUrl, { params }).pipe(
      map((response: any) => {
        // El nuevo backend devuelve { courses: [], total: number, page: number, limit: number, totalPages: number }
        const mappedCourses = response.courses.map((course: any) => this.mapBackendToFrontend(course));
        return {
          courses: mappedCourses,
          total: response.total,
          page: response.page,
          limit: response.limit
        };
      }),
      retry(2),
      catchError(this.handleError)
    );
  }

  // GET /api/courses/public - Obtener cursos públicos (activos)
  getPublicCourses(): Observable<Course[]> {
    return this.http.get<any[]>(`${this.apiUrl}/public`).pipe(
      map((backendCourses: any[]) => backendCourses.map(course => this.mapBackendToFrontend(course))),
      retry(2),
      catchError(this.handleError)
    );
  }

  // GET /api/courses/:id - Obtener curso por ID
  getCourseById(id: number): Observable<Course> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map((backendCourse: any) => this.mapBackendToFrontend(backendCourse)),
      retry(2),
      catchError(this.handleError)
    );
  }

  // POST /api/courses - Crear nuevo curso
  createCourse(course: CreateCourseRequest): Observable<Course> {
    const backendRequest = this.mapFrontendToBackend(course);
    return this.http.post<any>(this.apiUrl, backendRequest).pipe(
      map((backendCourse: any) => this.mapBackendToFrontend(backendCourse)),
      catchError(this.handleError)
    );
  }

  // PUT /api/courses/:id - Actualizar curso existente
  updateCourse(course: UpdateCourseRequest): Observable<Course> {
    const backendRequest = this.mapFrontendToBackend(course);
    return this.http.put<any>(`${this.apiUrl}/${course.id}`, backendRequest).pipe(
      map((backendCourse: any) => this.mapBackendToFrontend(backendCourse)),
      catchError(this.handleError)
    );
  }

  // DELETE /api/courses/:id - Eliminar curso
  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Método para búsqueda de cursos
  searchCourses(searchTerm: string): Observable<Course[]> {
    const params = new HttpParams().set('search', searchTerm);
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((backendCourses: any[]) => backendCourses.map(course => this.mapBackendToFrontend(course))),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Método para obtener cursos por categoría
  getCoursesByCategory(category: string): Observable<Course[]> {
    const params = new HttpParams().set('category', category);
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((backendCourses: any[]) => backendCourses.map(course => this.mapBackendToFrontend(course))),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Método para obtener cursos por nivel
  getCoursesByLevel(level: string): Observable<Course[]> {
    const params = new HttpParams().set('level', level);
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((backendCourses: any[]) => backendCourses.map(course => this.mapBackendToFrontend(course))),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Método para obtener cursos por instructor
  getCoursesByInstructor(instructor: string): Observable<Course[]> {
    const params = new HttpParams().set('instructor', instructor);
    
    return this.http.get<any[]>(this.apiUrl, { params }).pipe(
      map((backendCourses: any[]) => backendCourses.map(course => this.mapBackendToFrontend(course))),
      retry(2),
      catchError(this.handleError)
    );
  }

  // Método para actualizar el estado local de cursos
  updateCoursesState(courses: Course[]): void {
    this.coursesSubject.next(courses);
  }

  // Método para obtener estadísticas de cursos (si el backend lo soporta)
  getCourseStats(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/stats`).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }
}
