import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/client'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

// Simple file upload handler
// For production, use Vercel Blob Storage or AWS S3
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const responseId = formData.get('responseId') as string
    const fieldRef = formData.get('fieldRef') as string

    if (!file || !responseId || !fieldRef) {
      return NextResponse.json(
        { error: 'Missing required fields: file, responseId, fieldRef' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      )
    }

    // Verify response exists
    const response = await prisma.response.findUnique({
      where: { id: responseId },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found' },
        { status: 404 }
      )
    }

    // For development: save to public/uploads
    // For production: upload to Vercel Blob or S3
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${randomUUID()}.${fileExtension}`
    
    // In production, upload to cloud storage and get URL
    // For now, we'll use a placeholder URL
    // TODO: Implement actual file storage (Vercel Blob or S3)
    const fileUrl = `/uploads/${fileName}`

    // Save file metadata to database
    const fileRecord = await prisma.file.create({
      data: {
        responseId,
        fieldRef,
        fileName: file.name,
        fileUrl, // In production, this will be the cloud storage URL
        fileSize: file.size,
        mimeType: file.type,
      },
    })

    // In development, save to public/uploads directory
    if (process.env.NODE_ENV === 'development') {
      const uploadsDir = join(process.cwd(), 'public', 'uploads')
      const filePath = join(uploadsDir, fileName)
      
      try {
        await writeFile(filePath, buffer)
      } catch (error) {
        console.error('Error saving file:', error)
        // Continue anyway - file metadata is saved
      }
    }

    return NextResponse.json({
      fileId: fileRecord.id,
      fileUrl: fileRecord.fileUrl,
      fileName: fileRecord.fileName,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
