// api/verify-payment.js
// Vérifie qu'une session Stripe est bien payée après le retour

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { sessionId } = req.body || {};
  if (!sessionId) return res.status(400).json({ error: "sessionId requis" });

  try {
    const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(400).json({ paid: false, error: "Session introuvable" });
    }

    const session = await response.json();

    // Vérifie que le paiement est bien complété
    const paid = session.payment_status === "paid";

    return res.status(200).json({
      paid,
      email:   session.customer_email || session.customer_details?.email || "",
      nom:     session.metadata?.nom || "",
      societe: session.metadata?.societe || "",
      // Date d'expiration = aujourd'hui + 31 jours
      expiresAt: paid ? Date.now() + (31 * 24 * 60 * 60 * 1000) : null,
    });

  } catch (err) {
    return res.status(500).json({ paid: false, error: err.message });
  }
}
