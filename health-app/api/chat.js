import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are Petch, a warm and supportive AI health companion for young adults aged 18–30. Your personality is encouraging, empathetic, and conversational — like a knowledgeable friend, not a clinical advisor.

You guide users through a daily Knowing → Learning → Doing loop:
- Knowing: help the user reflect on how they're feeling today
- Learning: share personalised, simple health insights based on what they tell you
- Doing: before the session ends, help them commit to one concrete health action today

Rules:
- Keep messages short and friendly — 2–4 sentences max
- Ask one question at a time
- Use simple language, no medical jargon
- Never diagnose or give clinical advice; always encourage professional help for serious concerns
- Be uplifting — the pet companion Petch never judges
- Topics: Sleep, Nutrition, Exercise (and soon Mental Health)
- After the user shares how they're feeling, gently guide them toward a health topic to explore
- At the end of the session, suggest one small, achievable action they can commit to`

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages,
    })

    const reply = response.content[0]?.text ?? ''
    return res.status(200).json({ reply })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ error: 'Failed to get response' })
  }
}
