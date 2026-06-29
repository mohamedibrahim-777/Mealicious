import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'GEMINI_API_KEY or GOOGLE_API_KEY is not defined in environment variables.',
      env: {
        GEMINI_API_KEY: 'not set',
        GOOGLE_API_KEY: 'not set',
      }
    })
  }

  let testResult: any = null
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hello' }] }],
          generationConfig: { maxOutputTokens: 20 },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      testResult = {
        success: false,
        status: response.status,
        error: errText,
      }
    } else {
      const data = await response.json()
      testResult = {
        success: true,
        response: data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'no content',
      }
    }
  } catch (e: any) {
    testResult = {
      success: false,
      error: e.message,
    }
  }

  return NextResponse.json({
    success: true,
    env: {
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'set (starts with ' + process.env.GEMINI_API_KEY.substring(0, 4) + '...)' : 'not set',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY ? 'set (starts with ' + process.env.GOOGLE_API_KEY.substring(0, 4) + '...)' : 'not set',
    },
    testResult,
  })
}
