import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CreateFeedbackData, ApiResponse, FeedbackWithVotes } from '@/lib/types'

// GET /api/feedback - List all feedback with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const tag = searchParams.get('tag')
    const userId = searchParams.get('userId')
    
    const skip = (page - 1) * limit
    
    // Build where clause
    const where: any = {}
    if (tag && tag !== 'all') {
      where.tags = { has: tag }
    }
    
    // Get feedback with author and votes
    const [feedback, total] = await Promise.all([
      db.feedback.findMany({
        where,
        include: {
          author: true,
          votes: {
            include: {
              user: true
            }
          },
        },
        orderBy: [
          { upvotes: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit,
      }),
      db.feedback.count({ where })
    ])
    
    // Add hasUserUpvoted field if userId is provided
    const feedbackWithVotes: FeedbackWithVotes[] = feedback.map(item => ({
      ...item,
      hasUserUpvoted: userId 
        ? item.votes.some(vote => vote.user.id === userId)
        : false
    }))
    
    return NextResponse.json({
      success: true,
      data: feedbackWithVotes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}

// POST /api/feedback - Create new feedback
export async function POST(request: NextRequest) {
  try {
    const body: CreateFeedbackData = await request.json()
    const { title, description, tags, authorId } = body
    
    // Validate required fields
    if (!title || !description || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and author ID are required' },
        { status: 400 }
      )
    }
    
    // Verify user exists
    const user = await db.user.findUnique({
      where: { id: authorId }
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Create feedback
    const feedback = await db.feedback.create({
      data: {
        title,
        description,
        tags: tags || [],
        authorId: user.id,
      },
      include: {
        author: true,
        votes: true,
      }
    })
    
    const response: ApiResponse<FeedbackWithVotes> = {
      success: true,
      data: {
        ...feedback,
        hasUserUpvoted: false
      }
    }
    
    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating feedback:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create feedback' },
      { status: 500 }
    )
  }
} 