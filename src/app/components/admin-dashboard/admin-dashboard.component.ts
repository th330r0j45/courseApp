import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  courses: Course[] = [];
  totalCourses: number = 0;
  totalStudents: number = 0;
  averageRating: number = 0;
  recentCourses: Course[] = [];
  isLoading: boolean = false;

  constructor(
    private courseService: CourseService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.courseService.getAllCourses(1, 100).subscribe({
      next: (response) => {
        this.courses = response.courses;
        this.totalCourses = response.total;
        this.calculateStats();
        this.recentCourses = this.courses
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .slice(0, 5);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos del dashboard:', error);
        this.isLoading = false;
      }
    });
  }

  private calculateStats(): void {
    this.totalStudents = this.courses.reduce((total, course) => total + (course.studentsCount || 0), 0);
    
    const coursesWithRating = this.courses.filter(course => course.rating && course.rating > 0);
    if (coursesWithRating.length > 0) {
      this.averageRating = coursesWithRating.reduce((total, course) => total + (course.rating || 0), 0) / coursesWithRating.length;
    }
  }

  getCourseLevelColor(level: string): string {
    switch (level) {
      case 'Principiante': return '#22c55e';
      case 'Intermedio': return '#f59e0b';
      case 'Avanzado': return '#ef4444';
      default: return '#6b7280';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  getTotalCatalogValue(): number {
    return this.courses.reduce((sum, course) => sum + course.price, 0);
  }
  handleImageError(event: any): void {
    event.target.src = '/assets/images/default-course.svg';
  }

  deleteCourse(courseId: number): void {
    if (confirm('¿Estás seguro de que quieres eliminar este curso? Esta acción no se puede deshacer.')) {
      this.courseService.deleteCourse(courseId).subscribe({
        next: () => {
          this.loadDashboardData(); // Recargar datos después de eliminar
          this.toastr.success('Curso eliminado exitosamente', '¡Éxito!');
        },
        error: (error) => {
          console.error('Error al eliminar curso:', error);
          this.toastr.error('Error al eliminar el curso. Por favor, inténtalo de nuevo.', 'Error');
        }
      });
    }
  }
}
