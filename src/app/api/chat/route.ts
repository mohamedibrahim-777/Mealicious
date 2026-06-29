import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const ZAI = (await import('z-ai-web-dev-sdk')).default
    let zai;
    if (process.env.ZAI_BASE_URL && process.env.ZAI_API_KEY) {
      zai = new ZAI({
        baseUrl: process.env.ZAI_BASE_URL,
        apiKey: process.env.ZAI_API_KEY,
      });
    } else {
      zai = await ZAI.create()
    }

    const systemPrompt = `You are Mealie, the friendly AI assistant for Mealicious Store (MEALICIOUS VENTURES PRIVATE LIMITED), a premium health snacks and dry fruits e-commerce brand based in India.

Your role:
- Help customers with product recommendations, order queries, and general questions
- Be warm, helpful, and knowledgeable about dry fruits, nuts, and healthy snacks
- Provide information about our products: Premium Cashews (W240, K320, Honey Roasted), Almonds (California, Roasted Salted), Trail Mix (Classic, Protein Power), Dried Fruits (Afghan Raisins, Turkish Apricots, Medjool Dates), Flavored Nuts (Peri Peri Cashews, Chocolate Almonds), Seeds & Berries (Super Seeds Mix, Dried Cranberries), Combo Packs (Family Feast, Diwali Hamper), Healthy Snacks (Quinoa Crunch, Makhana), Pistachios, Walnuts
- Key policies: Free shipping on orders above ₹499, FSSAI-compliant no return policy, COD available, FSSAI certified products
- Contact: support@mealicious.in
- Keep responses concise (2-4 sentences typically)
- If you don't know something, direct customers to support@mealicious.in
- Never make up product prices or specific details you're unsure about
- Respond in the same language the customer uses (English or Hindi)`

    const messages = [
      { role: 'assistant' as const, content: systemPrompt },
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' as const : 'assistant' as const,
        content: h.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const trimmedMessages = messages.length > 20 
      ? [messages[0], ...messages.slice(-19)] 
      : messages

    const completion = await zai.chat.completions.create({
      messages: trimmedMessages,
      thinking: { type: 'disabled' },
    })

    const response = completion.choices?.[0]?.message?.content || 
      "I'm sorry, I couldn't process that. Please try again or contact us at support@mealicious.in"

    return NextResponse.json({ success: true, response })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}
