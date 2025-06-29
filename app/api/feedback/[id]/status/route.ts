import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isAdmin, FEEDBACK_STATUSES, FeedbackStatus } from '@/lib/admin'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json()
    const { userId, status } = body

    // Get user and validate admin access
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || !isAdmin(user.email)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized: Admin access required'
      }, { status: 403 })
    }

    // Validate status value
    if (!FEEDBACK_STATUSES.includes(status as FeedbackStatus)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status value'
      }, { status: 400 })
    }

    // Check if feedback exists
    const existingFeedback = await db.feedback.findUnique({
      where: { id }
    })

    if (!existingFeedback) {
      return NextResponse.json({
        success: false,
        error: 'Feedback not found'
      }, { status: 404 })
    }

    // Update feedback status
    const updatedFeedback = await db.feedback.update({
      where: { id },
      data: { status },
      include: {
        author: true,
        votes: true,
        _count: {
          select: {
            responses: true
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        ...updatedFeedback,
        hasUserUpvoted: false, // Will be updated by client if needed
        responseCount: updatedFeedback._count.responses
      }
    })

  } catch (error) {
    console.error('Error updating feedback status:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
} 