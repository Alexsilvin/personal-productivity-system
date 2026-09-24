import { z } from 'zod';

export const taskStatusSchema = z.enum(['draft', 'queued', 'in_progress', 'blocked', 'completed', 'cancelled']);
export const taskPrioritySchema = z.enum(['critical', 'important', 'normal', 'optional']);

export const createTaskSchema = z
  .object({
    userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
    projectId: z.string().uuid({ message: 'projectId must be a valid UUID' }).nullable().optional(),
    courseId: z.string().uuid({ message: 'courseId must be a valid UUID' }).nullable().optional(),
    goalId: z.string().uuid({ message: 'goalId must be a valid UUID' }).nullable().optional(),
    title: z
      .string({ required_error: 'title is required' })
      .trim()
      .min(1, 'title must not be empty')
      .max(255, 'title must be 255 characters or fewer'),
    description: z
      .preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional())
      .optional(),
    status: taskStatusSchema.default('draft'),
    priority: taskPrioritySchema.default('normal'),
    estimatedDurationMinutes: z
      .number({ required_error: 'estimatedDurationMinutes is required', invalid_type_error: 'estimatedDurationMinutes must be a number' })
      .int('estimatedDurationMinutes must be an integer')
      .positive('estimatedDurationMinutes must be greater than 0')
      .max(10080, 'estimatedDurationMinutes must be 10080 or fewer'),
    minimumDurationMinutes: z
      .number({ required_error: 'minimumDurationMinutes is required', invalid_type_error: 'minimumDurationMinutes must be a number' })
      .int('minimumDurationMinutes must be an integer')
      .positive('minimumDurationMinutes must be greater than 0')
      .max(10080, 'minimumDurationMinutes must be 10080 or fewer'),
    dueAt: z.string().datetime({ offset: true, message: 'dueAt must be a valid ISO timestamp' }).nullable().optional(),
    completedAt: z
      .string()
      .datetime({ offset: true, message: 'completedAt must be a valid ISO timestamp' })
      .nullable()
      .optional(),
  })
  .strict();

export const updateTaskSchema = z
  .object({
    projectId: z.string().uuid({ message: 'projectId must be a valid UUID' }).nullable().optional(),
    courseId: z.string().uuid({ message: 'courseId must be a valid UUID' }).nullable().optional(),
    goalId: z.string().uuid({ message: 'goalId must be a valid UUID' }).nullable().optional(),
    title: z
      .string()
      .trim()
      .min(1, 'title must not be empty')
      .max(255, 'title must be 255 characters or fewer')
      .optional(),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    estimatedDurationMinutes: z
      .number({ invalid_type_error: 'estimatedDurationMinutes must be a number' })
      .int('estimatedDurationMinutes must be an integer')
      .positive('estimatedDurationMinutes must be greater than 0')
      .max(10080, 'estimatedDurationMinutes must be 10080 or fewer')
      .optional(),
    minimumDurationMinutes: z
      .number({ invalid_type_error: 'minimumDurationMinutes must be a number' })
      .int('minimumDurationMinutes must be an integer')
      .positive('minimumDurationMinutes must be greater than 0')
      .max(10080, 'minimumDurationMinutes must be 10080 or fewer')
      .optional(),
    dueAt: z.string().datetime({ offset: true, message: 'dueAt must be a valid ISO timestamp' }).nullable().optional(),
    completedAt: z
      .string()
      .datetime({ offset: true, message: 'completedAt must be a valid ISO timestamp' })
      .nullable()
      .optional(),
  })
  .strict();

export const taskIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Task id must be a valid UUID' }),
});

export const listTasksQuerySchema = z
  .object({
    user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
    status: taskStatusSchema.optional(),
    priority: taskPrioritySchema.optional(),
    project_id: z.string().uuid({ message: 'project_id must be a valid UUID' }).optional(),
    course_id: z.string().uuid({ message: 'course_id must be a valid UUID' }).optional(),
    goal_id: z.string().uuid({ message: 'goal_id must be a valid UUID' }).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .transform((query) => ({
    userId: query.user_id,
    status: query.status,
    priority: query.priority,
    projectId: query.project_id,
    courseId: query.course_id,
    goalId: query.goal_id,
    limit: query.limit,
    offset: query.offset,
  }));

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type TaskListQuery = z.infer<typeof listTasksQuerySchema>;
