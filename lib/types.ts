import { Feedback, User, FeedbackVote } from '@prisma/client'
import { FeedbackStatus } from './admin'

// Base types from Prisma
export type FeedbackType = Feedback
export type UserType = User
export type FeedbackVoteType = FeedbackVote

// Response types (manual definition until Prisma client updates)
export interface ResponseType {
  id: string
  content: string
  createdAt: Date
  updatedAt: Date
  authorId: string
  feedbackId: string
  parentId: string | null
}

// Extended types with relations
export type FeedbackWithAuthor = Feedback & {
  author: User
  votes: FeedbackVote[]
  responses?: ResponseWithAuthor[]
  hasUserUpvoted?: boolean
}

export type FeedbackWithVotes = Feedback & {
  votes: FeedbackVote[]
  responses?: ResponseWithAuthor[]
  hasUserUpvoted?: boolean
  author?: User
}

export type ResponseWithAuthor = ResponseType & {
  author: User
  replies?: ResponseWithAuthor[]
}

export type ResponseWithReplies = ResponseType & {
  author: User
  replies: ResponseWithAuthor[]
}

// Form data types
export interface CreateFeedbackData {
  title: string
  description: string
  tags: string[]
  authorId: string
}

export interface UpdateFeedbackData {
  title?: string
  description?: string
  tags?: string[]
  status?: FeedbackStatus
}

export interface CreateResponseData {
  content: string
  authorId: string
  feedbackId: string
  parentId?: string | null  // For nested responses
}

// Tag options
export const FEEDBACK_TAGS = [
  'Feature Request',
  'Bug', 
  'Issue',
  'General'
] as const

export type FeedbackTag = typeof FEEDBACK_TAGS[number]

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
} 