import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';
import { CourseCardComponent } from '../course-card/course-card.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-detail',
  imports: [CommonModule, RouterModule, CourseCardComponent],
  templateUrl: './course-detail.component.html',
  styleUrl: './course-detail.component.css'
})
export class CourseDetailComponent implements OnInit {
  course: Course | null = null;
  isLoading = true;
  isFavorite = false;
  relatedCourses: Course[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCourse();
  }

  private loadCourse(): void {
    const courseId = this.route.snapshot.paramMap.get('id');
    
    if (!courseId) {
      this.router.navigate(['/courses']);
      return;
    }

    this.isLoading = true;
    
    this.courseService.getCourseById(+courseId).subscribe({
      next: (course) => {
        this.course = course;
        this.isLoading = false;
        this.checkIfFavorite();
        this.loadRelatedCourses();
      },
      error: (error) => {
        console.error('Error loading course:', error);
        this.isLoading = false;
        this.course = null;
      }
    });
  }

  private loadRelatedCourses(): void {
    if (!this.course) return;
    
    // Buscar cursos de la misma categoría
    this.courseService.getCoursesByCategory(this.course.category).subscribe({
      next: (courses) => {
        // Filtrar el curso actual y tomar solo 3 cursos relacionados
        this.relatedCourses = courses
          .filter(c => c.id !== this.course?.id)
          .slice(0, 3);
      },
      error: (error) => {
        console.error('Error loading related courses:', error);
        this.relatedCourses = [];
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  }

  toggleFavorite(): void {
    if (!this.course) return;
    
    this.isFavorite = !this.isFavorite;
    
    // Simular guardar en localStorage (en un caso real sería en backend)
    const favorites = this.getFavorites();
    if (this.isFavorite) {
      favorites.push(this.course.id!);
      console.log(`✅ Curso "${this.course.title}" agregado a favoritos`);
    } else {
      const index = favorites.indexOf(this.course.id!);
      if (index > -1) {
        favorites.splice(index, 1);
        console.log(`❌ Curso "${this.course.title}" removido de favoritos`);
      }
    }
    
    localStorage.setItem('favoriteCourses', JSON.stringify(favorites));
  }

  shareCourse(): void {
    if (!this.course) return;
    
    const shareData = {
      title: this.course.title,
      text: `¡Mira este increíble curso: "${this.course.title}" por ${this.course.instructor}!`,
      url: window.location.href
    };
    
    // Intentar usar Web Share API si está disponible
    if (navigator.share) {
      navigator.share(shareData).catch(err => console.log('Error al compartir:', err));
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        console.log('✅ URL copiada al portapapeles');
        this.toastr.success('¡URL del curso copiada al portapapeles!', '¡Éxito!');
      }).catch(() => {
        // Fallback final: mostrar la URL
        prompt('Copia esta URL para compartir:', window.location.href);
      });
    }
  }

  private checkIfFavorite(): void {
    if (!this.course?.id) return;
    
    const favorites = this.getFavorites();
    this.isFavorite = favorites.includes(this.course.id);
  }

  private getFavorites(): number[] {
    const favoritesStr = localStorage.getItem('favoriteCourses');
    return favoritesStr ? JSON.parse(favoritesStr) : [];
  }
}
