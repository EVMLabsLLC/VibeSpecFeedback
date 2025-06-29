import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ApiResponse } from '@/lib/types'

interface VoteRequestBody {
  userId: string
}

// POST /api/feedback/[id]/vote - Toggle vote on feedback
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: feedbackId } = await params
    const body: VoteRequestBody = await request.json()
    const { userId } = body
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      )
    }
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check if feedback exists
    const feedback = await db.feedback.findUnique({
      where: { id: feedbackId }
    })
    
    if (!feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      )
    }
    
    // Check if user has already voted
    const existingVote = await db.feedbackVote.findUnique({
      where: {
        userId_feedbackId: {
          userId: user.id,
          feedbackId: feedbackId
        }
      }
    })
    
    if (existingVote) {
      // Remove vote (downvote)
      await db.$transaction([
        db.feedbackVote.delete({
          where: { id: existingVote.id }
        }),
        db.feedback.update({
          where: { id: feedbackId },
          data: { upvotes: { decrement: 1 } }
        })
      ])
      
      const response: ApiResponse<{ hasUpvoted: boolean; upvotes: number }> = {
        success: true,
        data: {
          hasUpvoted: false,
          upvotes: feedback.upvotes - 1
        }
      }
      
      return NextResponse.json(response)
    } else {
      // Add vote (upvote)
      const [, updatedFeedback] = await db.$transaction([
        db.feedbackVote.create({
          data: {
            userId: user.id,
            feedbackId: feedbackId
          }
        }),
        db.feedback.update({
          where: { id: feedbackId },
          data: { upvotes: { increment: 1 } }
        })
      ])
      
      const response: ApiResponse<{ hasUpvoted: boolean; upvotes: number }> = {
        success: true,
        data: {
          hasUpvoted: true,
          upvotes: updatedFeedback.upvotes
        }
      }
      
      return NextResponse.json(response)
    }
  } catch (error) {
    console.error('Error toggling vote:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to toggle vote' },
      { status: 500 }
    )
  }
} 