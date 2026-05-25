import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error
  const rows = await db.contactMessage.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ messages: rows })
}
