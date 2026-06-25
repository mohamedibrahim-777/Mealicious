import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    const email = process.env.SHIPROCKET_EMAIL || ''
    const password = process.env.SHIPROCKET_PASSWORD || ''
    const pickupName = process.env.SHIPROCKET_PICKUP_NAME || ''

    // Check which .env files exist
    const targets = [
      path.join(process.cwd(), '.env'),
      path.join(process.cwd(), '..', '.env'),
      path.join(process.cwd(), '..', '..', '.env'),
    ]

    const envFiles = targets.map(p => ({
      path: p,
      exists: fs.existsSync(p),
    }))

    // Try a test login to Shiprocket
    let testAuthResult = ''
    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const text = await res.text()
      testAuthResult = `Status: ${res.status} - Response: ${text}`
    } catch (e: any) {
      testAuthResult = `Fetch failed: ${e.message}`
    }

    return NextResponse.json({
      cwd: process.cwd(),
      envFiles,
      loadedCredentials: {
        email: email ? `${email.substring(0, 3)}... (length: ${email.length})` : 'NOT_SET',
        passwordLength: password ? password.length : 0,
        pickupName: pickupName || 'NOT_SET',
      },
      testAuthResult,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
