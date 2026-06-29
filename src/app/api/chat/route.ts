import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API Key is not configured. Please set GEMINI_API_KEY in your .env file.' },
        { status: 500 }
      )
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

    // Format chat history for Gemini API
    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      })),
      { role: 'user', parts: [{ text: message }] },
    ]

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemPrompt }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    )

    if (!response.ok) {
      const errText = await response.text()
      console.error('Gemini API Error response:', errText)
      throw new Error(`Gemini API returned status ${response.status}: ${errText}`)
    }

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
      "I'm sorry, I couldn't process that. Please try again or contact us at support@mealicious.in"

    return NextResponse.json({ success: true, response: reply })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process your message. Please try again.' },
      { status: 500 }
    )
  }
}
