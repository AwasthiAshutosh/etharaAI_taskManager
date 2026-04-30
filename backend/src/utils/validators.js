const { z } = require('zod');

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['Admin', 'Member']).optional().default('Member'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional().default(''),
  members: z.array(z.string()).optional().default([]),
});

const updateProjectSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  members: z.array(z.string()).optional(),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(150),
  description: z.string().max(1000).optional().default(''),
  projectId: z.string().min(1, 'Project ID is required'),
  assignedTo: z.string().nullable().optional().default(null),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional().default('To Do'),
  priority: z.enum(['Low', 'Medium', 'High']).optional().default('Medium'),
  dueDate: z.string().nullable().optional().default(null),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(150).optional(),
  description: z.string().max(1000).optional(),
  assignedTo: z.string().nullable().optional(),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
  priority: z.enum(['Low', 'Medium', 'High']).optional(),
  dueDate: z.string().nullable().optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
};
