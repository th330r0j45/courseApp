export interface Course {
  id?: number;
  title: string;
  description: string;
  instructor: string;
  duration: number; // en horas
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  price: number;
  imageUrl?: string;
  category: string;
  rating?: number;
  studentsCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface CourseResponse {
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateCourseRequest {
  title: string;
  description: string;
  instructor: string;
  duration: number;
  level: 'Principiante' | 'Intermedio' | 'Avanzado';
  price: number;
  imageUrl?: string;
  category: string;
}

export interface UpdateCourseRequest extends Partial<CreateCourseRequest> {
  id: number;
}
