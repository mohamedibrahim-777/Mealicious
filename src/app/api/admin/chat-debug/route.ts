import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-server'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'

export async function GET(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  const homeDir = os.homedir()
  const paths = [
    { name: 'project-cwd', path: path.join(process.cwd(), '.z-ai-config') },
    { name: 'user-home', path: path.join(homeDir, '.z-ai-config') },
    { name: 'etc-config', path: '/etc/.z-ai-config' },
  ]

  const fileChecks = []
  let loadedConfig: any = null

  for (const p of paths) {
    try {
      const exists = await fs.access(p.path).then(() => true).catch(() => false)
      let parsed: any = null
      let readError: string | null = null
      if (exists) {
        try {
          const str = await fs.readFile(p.path, 'utf8')
          parsed = JSON.parse(str)
          if (parsed.baseUrl && parsed.apiKey) {
            loadedConfig = {
              source: p.name,
              baseUrl: parsed.baseUrl,
              apiKeyMasked: parsed.apiKey ? `${parsed.apiKey.substring(0, 6)}...${parsed.apiKey.substring(parsed.apiKey.length - 4)}` : 'missing',
            }
          }
        } catch (e: any) {
          readError = e.message
        }
      }
      fileChecks.push({
        name: p.name,
        path: p.path,
        exists,
        isValid: !!(parsed && parsed.baseUrl && parsed.apiKey),
        readError,
      })
    } catch (e: any) {
      fileChecks.push({
        name: p.name,
        path: p.path,
        exists: false,
        isValid: false,
        error: e.message,
      })
    }
  }

  let testResult: any = null
  try {
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    let zai: any = null
    if (process.env.ZAI_BASE_URL && process.env.ZAI_API_KEY) {
      zai = new ZAI({ baseUrl: process.env.ZAI_BASE_URL, apiKey: process.env.ZAI_API_KEY })
    } else {
      zai = await ZAI.create()
    }
    const response = await zai.chat.completions.create({
      messages: [{ role: 'user', content: 'hello' }],
      thinking: { type: 'disabled' },
    })
    testResult = {
      success: true,
      response: response.choices?.[0]?.message?.content ?? 'no response content',
    }
  } catch (e: any) {
    testResult = {
      success: false,
      error: e.message,
      stack: e.stack,
    }
  }

  return NextResponse.json({
    success: true,
    env: {
      ZAI_BASE_URL: process.env.ZAI_BASE_URL ? 'set' : 'not set',
      ZAI_API_KEY: process.env.ZAI_API_KEY ? 'set' : 'not set',
    },
    fileChecks,
    loadedConfig,
    testResult,
  })
}
