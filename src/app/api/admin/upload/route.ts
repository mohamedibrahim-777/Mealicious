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
    
    const rootUploadDir = path.join(process.cwd(), 'public', 'uploads')
    const standaloneUploadDir = path.join(process.cwd(), '.next', 'standalone', 'public', 'uploads')
    
    // 1. Write to persistent public/uploads folder
    await mkdir(rootUploadDir, { recursive: true })
    const rootFilePath = path.join(rootUploadDir, filename)
    await writeFile(rootFilePath, buffer)
    
    // 2. Write to standalone production folder if it exists
    try {
      await mkdir(standaloneUploadDir, { recursive: true })
      const standaloneFilePath = path.join(standaloneUploadDir, filename)
      await writeFile(standaloneFilePath, buffer)
    } catch (e) {
      // Ignore if we are not running in standalone production mode
    }
    
    // Return relative public path
    return NextResponse.json({ url: `/uploads/${filename}` })
  } catch (err: any) {
    console.error('File upload error:', err)
    return NextResponse.json({ error: err.message || 'File upload failed' }, { status: 500 })
  }
}
