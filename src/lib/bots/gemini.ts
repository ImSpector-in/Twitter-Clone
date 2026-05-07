export async function generateReply(systemPrompt: string, originalTweet: string): Promise<string> {
  return callGroq(systemPrompt, `Reply to this tweet in character. Keep it under 240 characters, no hashtags, no emojis, no quotation marks:\n\n"${originalTweet}"`)
}

export async function generateTweet(systemPrompt: string, topic: string): Promise<string> {
  return callGroq(systemPrompt, `Write a tweet about this topic: ${topic}`)
}

async function callGroq(systemPrompt: string, userMessage: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY is not set')

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.9,
      max_tokens: 120,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text: string = data.choices?.[0]?.message?.content ?? ''

  // Clean up — remove surrounding quotes and trim
  const cleaned = text.trim().replace(/^["']|["']$/g, '').trim()

  // Hard cap at 280 chars as a safety net
  return cleaned.slice(0, 280)
}
