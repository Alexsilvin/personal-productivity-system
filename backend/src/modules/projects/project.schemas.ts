import { z } from 'zod';

export const projectStatusSchema = z.enum(['draft', 'active', 'paused', 'completed', 'archived']);
export const projectPrioritySchema = z.enum(['critical', 'important', 'normal', 'optional']);

export const createProjectSchema = z
  .object({
    userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
    goalId: z.string().uuid({ message: 'goalId must be a valid UUID' }).nullable().optional(),
    title: z
      .string({ required_error: 'title is required' })
      .trim()
      .min(1, 'title must not be empty')
      .max(255, 'title must be 255 characters or fewer'),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: projectStatusSchema.default('active'),
    priority: projectPrioritySchema.default('normal'),
  })
  .strict();

export const updateProjectSchema = z
  .object({
    goalId: z.string().uuid({ message: 'goalId must be a valid UUID' }).nullable().optional(),
    title: z.string().trim().min(1, 'title must not be empty').max(255, 'title must be 255 characters or fewer').optional(),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: projectStatusSchema.optional(),
    priority: projectPrioritySchema.optional(),
  })
  .strict();

export const projectIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Project id must be a valid UUID' }),
});

export const listProjectsQuerySchema = z
  .object({
    user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
    goal_id: z.string().uuid({ message: 'goal_id must be a valid UUID' }).optional(),
    status: projectStatusSchema.optional(),
    priority: projectPrioritySchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .transform((query) => ({
    userId: query.user_id,
    goalId: query.goal_id,
    status: query.status,
    priority: query.priority,
    limit: query.limit,
    offset: query.offset,
  }));

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ProjectListQuery = z.infer<typeof listProjectsQuerySchema>;
