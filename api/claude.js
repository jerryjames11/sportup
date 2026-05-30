// /api/claude.js — Vercel serverless function
// This runs SERVER-SIDE only. The ANTHROPIC_API_KEY env var is never sent to the browser.

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Basic origin check — only allow requests from your own domain
  const origin = req.headers.origin || "";
  const allowed = [
    process.env.ALLOWED_ORIGIN,          // e.g. https://sportup.vercel.app
    "http://localhost:5173",             // local dev
    "http://localhost:4173",             // local preview
  ].filter(Boolean);

  if (allowed.length > 0 && !allowed.some(o => origin.startsWith(o))) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Rate limit: max 10 requests per IP per minute (simple in-memory, resets per cold start)
  // For production, replace with Redis/Upstash for persistence across instances
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || "unknown";
  const now = Date.now();
  if (!handler._rateMap) handler._rateMap = {};
  const entry = handler._rateMap[ip] || { count: 0, reset: now + 60000 };
  if (now > entry.reset) { entry.count = 0; entry.reset = now + 60000; }
  entry.count++;
  handler._rateMap[ip] = entry;
  if (entry.count > 10) {
    return res.status(429).json({ error: "Too many requests. Please wait a minute." });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server misconfiguration: missing API key" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch {
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Whitelist allowed models and cap max_tokens to prevent abuse
  const allowedModels = ["claude-sonnet-4-20250514"];
  if (!allowedModels.includes(body.model)) {
    return res.status(400).json({ error: "Model not allowed" });
  }
  if (!body.messages || !Array.isArray(body.messages)) {
    return res.status(400).json({ error: "Invalid messages" });
  }
  // Cap tokens to prevent runaway costs
  body.max_tokens = Math.min(body.max_tokens || 800, 1000);

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: data.error?.message || "Upstream error" });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error("Claude proxy error:", err);
    return res.status(500).json({ error: "Failed to reach Claude API" });
  }
}
