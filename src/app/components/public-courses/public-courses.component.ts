import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { CourseCardComponent } from '../course-card/course-card.component';

@Component({
  selector: 'app-public-courses',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CourseCardComponent],
  templateUrl: './public-courses.component.html',
  styleUrl: './public-courses.component.css'
})
export class PublicCoursesComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  categories: string[] = ['Todos', 'Programación', 'Diseño', 'Marketing', 'Negocios', 'Idiomas'];
  selectedCategory: string = 'Todos';
  searchTerm: string = '';
  isLoading: boolean = false;

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.loadCourses();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.courseService.getPublicCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.filteredCourses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar cursos:', error);
        this.isLoading = false;
      }
    });
  }

  onCategoryChange(): void {
    this.filterCourses();
  }

  onSearch(): void {
    this.filterCourses();
  }

  private filterCourses(): void {
    let filtered = this.courses;

    // Filtrar por categoría
    if (this.selectedCategory !== 'Todos') {
      filtered = filtered.filter(course => course.category === this.selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchLower) ||
        course.description.toLowerCase().includes(searchLower) ||
        course.instructor.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCourses = filtered;
  }
  clearSearch(): void {
    this.searchTerm = '';
    this.selectedCategory = 'Todos';
    this.filteredCourses = this.courses;
  }

  trackByCourseId(index: number, course: Course): number {
    return course.id || index;
  }
}
