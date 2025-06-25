import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Course } from '../../models/course.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './course-form.component.html',
  styleUrl: './course-form.component.css'
})
export class CourseFormComponent implements OnInit {
  courseForm: FormGroup;
  isEditMode: boolean = false;
  courseId: number | null = null;
  isLoading: boolean = false;
  isSubmitting: boolean = false;

  categories: string[] = [
    'Programación', 
    'Diseño', 
    'Marketing', 
    'Negocios', 
    'Idiomas', 
    'Ciencias', 
    'Arte', 
    'Música',
    'Fotografía',
    'Otros'
  ];

  levels: string[] = ['Principiante', 'Intermedio', 'Avanzado'];

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.courseForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.courseId = +params['id'];
        this.isEditMode = true;
        this.loadCourse();
      }
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      instructor: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      duration: ['', [Validators.required, Validators.min(1), Validators.max(1000)]],
      level: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      imageUrl: ['', [Validators.pattern(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i)]]
    });
  }

  loadCourse(): void {
    if (!this.courseId) return;
    
    this.isLoading = true;
    this.courseService.getCourseById(this.courseId).subscribe({
      next: (course) => {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          instructor: course.instructor,
          duration: course.duration,
          level: course.level,
          price: course.price,
          category: course.category,
          imageUrl: course.imageUrl || ''
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar el curso:', error);
        this.isLoading = false;
        this.toastr.error('Error al cargar el curso. Redirigiendo...', 'Error');
        this.router.navigate(['/admin/courses']);
      }
    });
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.markFormGroupTouched(this.courseForm);
      this.toastr.warning('Por favor, completa todos los campos requeridos correctamente', 'Formulario incompleto');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.courseForm.value;

    if (this.isEditMode && this.courseId) {
      // Update course
      const updateData = {
        id: this.courseId,
        ...formValue,
        imageUrl: formValue.imageUrl || undefined
      };

      this.courseService.updateCourse(updateData).subscribe({
        next: () => {
          this.toastr.success('Curso actualizado exitosamente', '¡Éxito!');
          this.router.navigate(['/admin/courses']);
        },
        error: (error) => {
          console.error('Error al actualizar curso:', error);
          this.toastr.error('Error al actualizar el curso. Inténtalo de nuevo.', 'Error');
          this.isSubmitting = false;
        }
      });
    } else {
      // Create new course
      const createData = {
        ...formValue,
        imageUrl: formValue.imageUrl || undefined
      };

      this.courseService.createCourse(createData).subscribe({
        next: () => {
          this.toastr.success('Curso creado exitosamente', '¡Éxito!');
          this.router.navigate(['/admin/courses']);
        },
        error: (error) => {
          console.error('Error al crear curso:', error);
          this.toastr.error('Error al crear el curso. Inténtalo de nuevo.', 'Error');
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    if (this.courseForm.dirty) {
      const confirmLeave = confirm('¿Estás seguro de que deseas salir? Los cambios no guardados se perderán.');
      if (!confirmLeave) {
        return;
      }
    }
    this.router.navigate(['/admin/courses']);
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getFieldError(fieldName: string): string {
    const control = this.courseForm.get(fieldName);
    if (control && control.errors && control.touched) {
      if (control.errors['required']) {
        return `${this.getFieldDisplayName(fieldName)} es requerido`;
      }
      if (control.errors['minlength']) {
        return `${this.getFieldDisplayName(fieldName)} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres`;
      }
      if (control.errors['maxlength']) {
        return `${this.getFieldDisplayName(fieldName)} no puede tener más de ${control.errors['maxlength'].requiredLength} caracteres`;
      }
      if (control.errors['min']) {
        return `${this.getFieldDisplayName(fieldName)} debe ser mayor a ${control.errors['min'].min}`;
      }
      if (control.errors['max']) {
        return `${this.getFieldDisplayName(fieldName)} no puede ser mayor a ${control.errors['max'].max}`;
      }
      if (control.errors['pattern']) {
        return `${this.getFieldDisplayName(fieldName)} debe ser una URL válida de imagen`;
      }
    }
    return '';
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      'title': 'Título',
      'description': 'Descripción',
      'instructor': 'Instructor',
      'duration': 'Duración',
      'level': 'Nivel',
      'price': 'Precio',
      'category': 'Categoría',
      'imageUrl': 'URL de imagen'
    };
    return displayNames[fieldName] || fieldName;
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.courseForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  formatPrice(value: string): string {
    const number = parseFloat(value);
    if (isNaN(number)) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(number);
  }

  onImageError(event: any): void {
    event.target.style.display = 'none';
  }

  onImageLoad(event: any): void {
    event.target.style.display = 'block';
  }
}
