import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json()
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400 })
    }
    await db.contactMessage.create({
      data: {
        name: String(name).trim(),
        email: String(email).trim(),
        phone: phone ? String(phone).trim() : null,
        subject: String(subject).trim(),
        message: String(message).trim(),
      },
    })
    return NextResponse.json({ success: true, message: 'Message sent successfully! We will get back to you soon.' })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
