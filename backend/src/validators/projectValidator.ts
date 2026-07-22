import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  repoUrl: z.string().url('Invalid repository URL').or(z.literal('')).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  deadline: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().or(z.literal('')),
  thumbnail: z.string().optional()
});

export const validateProjectInput = (req: Request, res: Response, next: NextFunction) => {
  const result = projectSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: result.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))
    });
  }

  // Assign parsed data back
  req.body = result.data;
  next();
};
