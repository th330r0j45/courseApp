import { Routes } from '@angular/router';
import { PublicCoursesComponent } from './components/public-courses/public-courses.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { CourseManagementComponent } from './components/course-management/course-management.component';
import { CourseFormComponent } from './components/course-form/course-form.component';
import { CourseDetailComponent } from './components/course-detail/course-detail.component';

export const routes: Routes = [
  // Ruta por defecto - Página pública de cursos
  { path: '', redirectTo: '/courses', pathMatch: 'full' },
  
  // Rutas públicas
  { path: 'courses', component: PublicCoursesComponent },
  { path: 'courses/:id', component: CourseDetailComponent }, // Detalle público del curso
  
  // Rutas de administración
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/courses', component: CourseManagementComponent },
  { path: 'admin/courses/new', component: CourseFormComponent },
  { path: 'admin/courses/:id/edit', component: CourseFormComponent },
  { path: 'admin/courses/:id', component: CourseFormComponent }, // Para ver detalles (modo solo lectura)
  
  // Ruta catch-all para manejar rutas no encontradas
  { path: '**', redirectTo: '/courses' }
];
