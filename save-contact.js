// api/create-checkout.js
// Crée une session Stripe Checkout pour l'abonnement 9€/mois

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, nom, societe } = req.body || {};

  // URL de base du site (Vercel la fournit automatiquement)
  const baseUrl = `https://${req.headers.host}`;

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[0]": "card",
        "mode": "subscription",
        "line_items[0][price_data][currency]": "eur",
        "line_items[0][price_data][product_data][name]": "Agent CIR/CII — 316 Développement",
        "line_items[0][price_data][product_data][description]": "Accès illimité à l'expert CIR/CII IA pendant 1 mois",
        "line_items[0][price_data][recurring][interval]": "month",
        "line_items[0][price_data][unit_amount]": "900", // 9.00€ en centimes
        "line_items[0][quantity]": "1",
        "customer_email": email || "",
        "metadata[nom]": nom || "",
        "metadata[societe]": societe || "",
        "success_url": `${baseUrl}/agent.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url":  `${baseUrl}/agent.html?payment=cancel`,
        "locale": "fr",
      }).toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Stripe error:", err);
      return res.status(400).json({ error: "Erreur Stripe : " + err });
    }

    const session = await response.json();
    return res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ error: err.message });
  }
}
