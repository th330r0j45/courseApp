import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './course-management.component.html',
  styleUrl: './course-management.component.css'
})
export class CourseManagementComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  searchTerm: string = '';
  selectedCategory: string = 'Todos';
  categories: string[] = ['Todos', 'Programación', 'Diseño', 'Marketing', 'Negocios', 'Idiomas'];
  isLoading: boolean = false;
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalItems: number = 0;

  constructor(private courseService: CourseService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses(this.currentPage, this.itemsPerPage).subscribe({
      next: (response) => {
        this.courses = response.courses;
        this.totalItems = response.total;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onCategoryChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    let filtered = [...this.courses];

    // Filter by category
    if (this.selectedCategory !== 'Todos') {
      filtered = filtered.filter(course => course.category === this.selectedCategory);
    }

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCourses = filtered;
  }

  deleteCourse(course: Course): void {
    if (!course.id) return;
    
    const confirmMessage = `¿Estás seguro de que deseas eliminar el curso "${course.title}"?`;
    if (confirm(confirmMessage)) {
      this.courseService.deleteCourse(course.id).subscribe({
        next: () => {
          this.loadCourses();
          this.toastr.success('Curso eliminado exitosamente', '¡Éxito!');
        },
        error: (error) => {
          console.error('Error al eliminar curso:', error);
          this.toastr.error('Error al eliminar el curso. Inténtalo de nuevo.', 'Error');
        }
      });
    }
  }
  toggleCourseStatus(course: Course): void {
    if (!course.id) return;
    
    const updatedCourse = {
      id: course.id,
      title: course.title,
      description: course.description,
      instructor: course.instructor,
      duration: course.duration,
      level: course.level,
      price: course.price,
      imageUrl: course.imageUrl,
      category: course.category,
      isActive: !course.isActive
    };

    this.courseService.updateCourse(updatedCourse).subscribe({
      next: () => {
        this.loadCourses();
      },
      error: (error) => {
        console.error('Error al actualizar estado del curso:', error);
        this.toastr.error('Error al actualizar el estado del curso.', 'Error');
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  getLevelClass(level: string): string {
    switch (level) {
      case 'Principiante':
        return 'level-beginner';
      case 'Intermedio':
        return 'level-intermediate';
      case 'Avanzado':
        return 'level-advanced';
      default:
        return '';
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'Todos';
    this.applyFilters();
  }

  // Pagination methods
  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  get paginationArray(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, -1);
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < total - 1) {
      rangeWithDots.push(-1, total);
    } else {
      rangeWithDots.push(total);
    }

    return rangeWithDots;
  }
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadCourses();
    }
  }

  trackByCourseId(index: number, course: Course): number {
    return course.id || index;
  }
  handleImageError(event: any): void {
    event.target.src = '/assets/images/default-course.svg';
  }
}
