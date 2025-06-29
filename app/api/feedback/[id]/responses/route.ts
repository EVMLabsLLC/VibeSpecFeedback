import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { CreateResponseData, ApiResponse, ResponseWithAuthor } from '@/lib/types'

// GET /api/feedback/[id]/responses - List all responses for a feedback item
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: feedbackId } = await params
    
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
    
    // Get responses with nested structure (up to 3 levels deep)
    const responses = await db.response.findMany({
      where: {
        feedbackId: feedbackId,
        parentId: null // Only top-level responses
      },
      include: {
        author: true,
        replies: {
          include: {
            author: true,
            replies: {
              include: {
                author: true,
                replies: {
                  include: {
                    author: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    const response: ApiResponse<ResponseWithAuthor[]> = {
      success: true,
      data: responses as ResponseWithAuthor[]
    }
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('❌ Error fetching responses:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}

// POST /api/feedback/[id]/responses - Create new response
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: feedbackId } = await params
    const body: CreateResponseData = await request.json()
    const { content, authorId, parentId } = body
    
    // Validate required fields
    if (!content || !authorId) {
      return NextResponse.json(
        { success: false, error: 'Content and author ID are required' },
        { status: 400 }
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
    
    // If parentId is provided, check if parent response exists
    if (parentId) {
      const parentResponse = await db.response.findUnique({
        where: { id: parentId }
      })
      
      if (!parentResponse) {
        return NextResponse.json(
          { success: false, error: 'Parent response not found' },
          { status: 404 }
        )
      }
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
    
    // Create response
    const newResponse = await db.response.create({
      data: {
        content,
        authorId: user.id,
        feedbackId: feedbackId,
        parentId: parentId || null,
      },
      include: {
        author: true,
        replies: true,
      }
    })
    
    const apiResponse: ApiResponse<ResponseWithAuthor> = {
      success: true,
      data: newResponse as ResponseWithAuthor
    }
    
    return NextResponse.json(apiResponse, { status: 201 })
  } catch (error) {
    console.error('❌ Error creating response:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create response' },
      { status: 500 }
    )
  }
} 