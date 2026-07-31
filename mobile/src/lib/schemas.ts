import {z} from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const forgotPasswordEmailSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

export const resetPasswordSchema = z
  .object({
    code: z.string().trim().min(6, 'Enter the 6-digit code').max(6, 'Enter the 6-digit code'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine(values => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const deckSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  subject: z.string().trim().min(1, 'Subject is required').max(80),
  description: z.string().trim().max(500).optional(),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type ForgotPasswordEmailValues = z.infer<typeof forgotPasswordEmailSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type DeckFormValues = z.infer<typeof deckSchema>;

export const cardSchema = z.object({
  question: z.string().trim().min(1, 'Question is required').max(2000),
  answer: z.string().trim().min(1, 'Answer is required').max(4000),
});

export const generateCardsSchema = z.object({
  sourceType: z.enum(['topic', 'notes']),
  content: z.string().trim().min(1, 'Enter a topic or paste your notes').max(20000),
  count: z.number().int().min(3).max(30),
  tone: z.enum(['concise', 'detailed', 'child-friendly', 'critical']),
});

export type CardFormValues = z.infer<typeof cardSchema>;
export type GenerateCardsFormValues = z.infer<typeof generateCardsSchema>;
