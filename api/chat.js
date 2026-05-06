// api/chat.js — retourne tokens_used pour comptage cote client
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { messages, system, max_tokens } = req.body || {};
  if (!messages || !Array.isArray(messages))
    return res.status(400).json({ error: "messages[] requis" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: max_tokens || 900,
        system: system || "",
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(response.status).json({ error: err });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";

    // Retourne tokens utilises pour comptage cote client
    const input_tokens  = data.usage?.input_tokens  || 0;
    const output_tokens = data.usage?.output_tokens || 0;
    const total_tokens  = input_tokens + output_tokens;

    // Cout en euros (Haiku: input 0.25$/M, output 1.25$/M)
    const cost_eur = ((input_tokens * 0.25 + output_tokens * 1.25) / 1_000_000) * 0.93;

    return res.status(200).json({ text, tokens_used: total_tokens, cost_eur });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
