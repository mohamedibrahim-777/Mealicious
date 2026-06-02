import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { normalizePhone } from '@/lib/whatsapp'

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''

// GET — Meta webhook verification handshake
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('hub.mode')
  const tokenParam = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && tokenParam === VERIFY_TOKEN && VERIFY_TOKEN) {
    return new NextResponse(challenge ?? '', { status: 200 })
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 })
}

// POST — inbound messages (handle STOP for opt-out)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const entries = body.entry ?? []
    for (const entry of entries) {
      const changes = entry.changes ?? []
      for (const change of changes) {
        const messages = change.value?.messages ?? []
        for (const msg of messages) {
          const from = msg.from as string | undefined
          const text = (msg.text?.body ?? '').trim().toUpperCase()
          if (from && (text === 'STOP' || text === 'UNSUBSCRIBE')) {
            const phone = normalizePhone(from)
            await db.whatsAppOptOut.upsert({
              where: { phone },
              create: { phone },
              update: {},
            }).catch(() => {})
          }
          // START / SUBSCRIBE re-opts in
          if (from && (text === 'START' || text === 'SUBSCRIBE')) {
            const phone = normalizePhone(from)
            await db.whatsAppOptOut.deleteMany({ where: { phone } }).catch(() => {})
          }
        }
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 }) // always 200 to Meta
  }
}
