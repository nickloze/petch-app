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
- At the end of the session, suggest one small, achievable action they can commit to

OUTPUT FORMAT — respond with ONLY valid JSON, no markdown fences, no preamble, no trailing text:
{
  "reply": "your conversational message here",
  "suggestions": ["short reply 1", "short reply 2", "short reply 3"]
}

"suggestions" must be exactly 3 short (2–5 word) natural follow-up replies the user could tap to keep the chat going. Phrase them as the user would say them back, not as Petch's questions. Make them specific to the conversation so far.`

// Robustly extract { reply, suggestions } from Claude's response. Handles:
//   1) pure JSON (model followed instructions)
//   2) JSON wrapped in ```json ... ``` fences
//   3) prose + JSON mixed (extract the largest balanced object)
//   4) total failure → fall back to raw prose with no suggestions
function parseModelResponse(raw) {
  const text = (raw || '').trim()
  if (!text) return { reply: '', suggestions: [] }

  try { return JSON.parse(text) } catch {}

  const fence = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/i)
  if (fence) {
    try { return JSON.parse(fence[1]) } catch {}
  }

  const first = text.indexOf('{')
  const last = text.lastIndexOf('}')
  if (first !== -1 && last > first) {
    try { return JSON.parse(text.slice(first, last + 1)) } catch {}
  }

  // Last resort — strip any fenced JSON so the user never sees raw output
  const prose = text.replace(/```(?:json)?[\s\S]*?```/gi, '').trim()
  return { reply: prose || text, suggestions: [] }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, inviteCheckIn, userContext } = req.body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' })
  }

  // When the client is about to surface the shiny "Start Daily Check-in"
  // CTA beneath this reply, we steer Petch's wording so the CTA feels
  // like the natural next step — regardless of topic. Never mention the
  // button by name; just end the reply on a warm, open invitation.
  const system = inviteCheckIn
    ? SYSTEM_PROMPT +
      `\n\n⚑ CRITICAL for THIS reply only:
The LAST SENTENCE of your "reply" MUST be an invitation to start today's daily check-in. NOT a follow-up question about their feelings, NOT open-ended curiosity — a direct, warm suggestion to do the check-in.

Good closers (pick one vibe, adapt to the user's message):
- "Wanna do today's quick check-in? It helps me spot patterns over time."
- "Feels like a great moment to run through today's check-in together — curious what it'll show?"
- "Let's do a quick check-in — I can get a clearer picture that way."
- "Want to start today's check-in? Even 2 minutes helps me understand you better."

Rules:
- Do NOT name any button, screen, or UI element. Keep it conversational.
- Make the invitation feel appropriate to WHATEVER the user said — excited, tired, neutral, anything. The check-in always pairs well with "I want to understand you better".
- Keep the total reply to 2–3 sentences. The check-in invite IS the final sentence.
- The "suggestions" array must be ONLY deferrals or "tell me more"-style replies (e.g. "Tell me more first", "Maybe later", "What does it cover?", "Not right now"). Do NOT include affirmative replies like "Yes", "Sure", "Let's do it" — an obvious primary button in the UI already handles the affirmative action, so a "Yes" chip is redundant.`
    : SYSTEM_PROMPT

  const finalSystem = userContext ? system + userContext : system

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: finalSystem,
      messages,
    })

    const raw = response.content[0]?.text ?? ''
    const parsed = parseModelResponse(raw)

    return res.status(200).json({
      reply: typeof parsed.reply === 'string' ? parsed.reply : '',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 3) : [],
    })
  } catch (err) {
    console.error('Claude API error:', err)
    return res.status(500).json({ error: 'Failed to get response' })
  }
}
