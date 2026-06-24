import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  // Require admin session
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Generate a unique filename using timestamp and random string
    const uniqueId = Date.now() + '-' + Math.random().toString(36).substring(2, 9)
    const originalExt = path.extname(file.name) || '.png'
    const filename = `${uniqueId}${originalExt}`
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Ensure public/uploads directory exists
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    // Return relative public path
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 })
  }
}
