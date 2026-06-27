import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'

export async function GET(req: NextRequest) {
  try {
    const { error } = await requireAdmin(req)
    if (error) return error

    const url = new URL(req.url)
    const orderNumber = url.searchParams.get('orderNumber')

    let orderData = null
    if (orderNumber) {
      const order = await db.order.findUnique({
        where: { orderNumber },
        select: { shippingAddr: true, user: { select: { name: true, email: true, phone: true } } }
      })
      if (order) {
        let parsedAddr = null
        try { parsedAddr = JSON.parse(order.shippingAddr) } catch {}
        orderData = {
          rawShippingAddr: order.shippingAddr,
          parsedAddr,
          user: order.user
        }
      } else {
        orderData = { error: 'Order not found' }
      }
    }

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
    let pickupLocationsResult = null
    try {
      const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const text = await res.text()
      testAuthResult = `Status: ${res.status} - Response: ${text}`
      
      try {
        const loginData = JSON.parse(text)
        if (loginData.token) {
          const pickupRes = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${loginData.token}`
            }
          })
          pickupLocationsResult = await pickupRes.json()
        }
      } catch {}
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
      pickupLocationsResult,
      orderData,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
