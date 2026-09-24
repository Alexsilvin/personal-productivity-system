import { z } from 'zod';

export const courseStatusSchema = z.enum(['draft', 'active', 'completed', 'archived']);

export const createCourseSchema = z
  .object({
    userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
    title: z
      .string({ required_error: 'title is required' })
      .trim()
      .min(1, 'title must not be empty')
      .max(255, 'title must be 255 characters or fewer'),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: courseStatusSchema.default('active'),
  })
  .strict();

export const updateCourseSchema = z
  .object({
    title: z.string().trim().min(1, 'title must not be empty').max(255, 'title must be 255 characters or fewer').optional(),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: courseStatusSchema.optional(),
  })
  .strict();

export const courseIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Course id must be a valid UUID' }),
});

export const listCoursesQuerySchema = z
  .object({
    user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
    status: courseStatusSchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .transform((query) => ({
    userId: query.user_id,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
  }));

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseListQuery = z.infer<typeof listCoursesQuerySchema>;
