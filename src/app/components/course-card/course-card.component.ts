import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course } from '../../models/course.model';

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  @Input() course!: Course;

  getLevelClass(): string {
    switch (this.course.level) {
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

  getLevelBadgeClass(): string {
    switch (this.course.level) {
      case 'Principiante':
        return 'bg-success';
      case 'Intermedio':
        return 'bg-warning';
      case 'Avanzado':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  getStarArray(): number[] {
    const rating = this.course.rating || 0;
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  handleImageError(event: any): void {
    event.target.src = '/assets/images/default-course.svg';
  }
}
