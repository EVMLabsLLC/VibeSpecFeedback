import { z } from 'zod'
import { FEEDBACK_TAGS } from './types'

// Feedback form validation schema
export const feedbackSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters long')
    .max(100, 'Title must be less than 100 characters')
    .trim(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description must be less than 1000 characters')
    .trim(),
  tags: z
    .array(z.enum(['Feature Request', 'Bug', 'Issue', 'General']))
    .default([])
    .optional()
})

// Response form validation schema
export const responseSchema = z.object({
  content: z
    .string()
    .min(3, 'Response must be at least 3 characters long')
    .max(500, 'Response must be less than 500 characters')
    .trim()
})

// Type inference from schemas
export type FeedbackFormData = z.infer<typeof feedbackSchema>
export type ResponseFormData = z.infer<typeof responseSchema>

// Validation error messages
export const ValidationMessages = {
  TITLE_REQUIRED: 'Title is required',
  TITLE_TOO_SHORT: 'Title must be at least 3 characters long',
  TITLE_TOO_LONG: 'Title must be less than 100 characters',
  DESCRIPTION_REQUIRED: 'Description is required',
  DESCRIPTION_TOO_SHORT: 'Description must be at least 10 characters long',
  DESCRIPTION_TOO_LONG: 'Description must be less than 1000 characters',
  RESPONSE_REQUIRED: 'Response is required',
  RESPONSE_TOO_SHORT: 'Response must be at least 3 characters long',
  RESPONSE_TOO_LONG: 'Response must be less than 500 characters',
} as const 