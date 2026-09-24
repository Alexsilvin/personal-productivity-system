import { z } from 'zod';

export const goalStatusSchema = z.enum(['draft', 'active', 'completed', 'archived']);
export const goalPrioritySchema = z.enum(['critical', 'important', 'normal', 'optional']);

export const createGoalSchema = z
  .object({
    userId: z.string().uuid({ message: 'userId must be a valid UUID' }),
    title: z
      .string({ required_error: 'title is required' })
      .trim()
      .min(1, 'title must not be empty')
      .max(255, 'title must be 255 characters or fewer'),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: goalStatusSchema.default('active'),
    priority: goalPrioritySchema.default('important'),
    targetDate: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'targetDate must be a valid ISO date')
      .nullable()
      .optional(),
  })
  .strict();

export const updateGoalSchema = z
  .object({
    title: z.string().trim().min(1, 'title must not be empty').max(255, 'title must be 255 characters or fewer').optional(),
    description: z.preprocess((value) => (value === '' ? null : value), z.string().trim().max(5000).nullable().optional()),
    status: goalStatusSchema.optional(),
    priority: goalPrioritySchema.optional(),
    targetDate: z
      .string()
      .refine((value) => !Number.isNaN(Date.parse(value)), 'targetDate must be a valid ISO date')
      .nullable()
      .optional(),
  })
  .strict();

export const goalIdParamSchema = z.object({
  id: z.string().uuid({ message: 'Goal id must be a valid UUID' }),
});

export const listGoalsQuerySchema = z
  .object({
    user_id: z.string().uuid({ message: 'user_id must be a valid UUID' }).optional(),
    status: goalStatusSchema.optional(),
    priority: goalPrioritySchema.optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  })
  .transform((query) => ({
    userId: query.user_id,
    status: query.status,
    priority: query.priority,
    limit: query.limit,
    offset: query.offset,
  }));

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type GoalListQuery = z.infer<typeof listGoalsQuerySchema>;
