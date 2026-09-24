import { AppError } from '../../common/errors.js';
import type { CourseRecord } from '../domain.js';
import type { CreateCourseInput, UpdateCourseInput } from './course.schemas.js';
import { courseRepository, type CourseListFilters } from './course.repository.js';

export class CourseService {
  constructor(private readonly repository = courseRepository) {}

  async createCourse(input: CreateCourseInput): Promise<CourseRecord> {
    const userExists = await this.repository.findUserById(input.userId);
    if (!userExists) {
      throw new AppError('USER_NOT_FOUND', 'User not found', 404);
    }

    const course = await this.repository.createCourse({
      userId: input.userId,
      title: input.title.trim(),
      description: input.description ?? null,
      status: input.status,
    });

    return course;
  }

  async getCourseById(id: string, userId?: string): Promise<CourseRecord> {
    const course = await this.repository.findCourseById(id);
    if (!course) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }
    if (userId && course.userId !== userId) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }
    return course;
  }

  async listCourses(filters: CourseListFilters, limit: number, offset: number): Promise<{ items: CourseRecord[]; total: number }> {
    return this.repository.listCourses(filters, limit, offset);
  }

  async updateCourse(id: string, userId: string, input: UpdateCourseInput): Promise<CourseRecord> {
    const existingCourse = await this.repository.findCourseById(id);
    if (!existingCourse) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }
    if (existingCourse.userId !== userId) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }

    const updatedCourse = await this.repository.updateCourse(id, {
      title: input.title !== undefined ? input.title.trim() : existingCourse.title,
      description: input.description !== undefined ? input.description : existingCourse.description,
      status: input.status !== undefined ? input.status : existingCourse.status,
    });

    if (!updatedCourse) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }

    return updatedCourse;
  }

  async deleteCourse(id: string, userId: string): Promise<void> {
    const existingCourse = await this.repository.findCourseById(id);
    if (!existingCourse) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }
    if (existingCourse.userId !== userId) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }

    const deleted = await this.repository.deleteCourse(id);
    if (!deleted) {
      throw new AppError('COURSE_NOT_FOUND', 'Course not found', 404);
    }
  }
}

export const courseService = new CourseService();
