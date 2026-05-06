// api/create-checkout.js — 2 plans : starter 9€ et pro 20€
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email, nom, societe, plan } = req.body || {};
  const baseUrl = `https://${req.headers.host}`;

  // Plans disponibles
  const PLANS = {
    starter: {
      name:         "316 Developpement - Starter",
      description:  "Acces referent CIR/CII - budget 3 euros API/mois",
      amount:       900,   // 9.00 euros en centimes
      token_budget: 600000,
      plan_id:      "starter"
    },
    pro: {
      name:         "316 Developpement - Pro",
      description:  "Acces referent CIR/CII - budget 10 euros API/mois",
      amount:       2000,  // 20.00 euros en centimes
      token_budget: 2000000,
      plan_id:      "pro"
    }
  };

  const selectedPlan = PLANS[plan] || PLANS.starter;

  try {
    const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "payment_method_types[0]":                          "card",
        "mode":                                             "subscription",
        "line_items[0][price_data][currency]":              "eur",
        "line_items[0][price_data][product_data][name]":    selectedPlan.name,
        "line_items[0][price_data][product_data][description]": selectedPlan.description,
        "line_items[0][price_data][recurring][interval]":   "month",
        "line_items[0][price_data][unit_amount]":           String(selectedPlan.amount),
        "line_items[0][quantity]":                          "1",
        "customer_email":                                   email || "",
        "metadata[nom]":                                    nom || "",
        "metadata[societe]":                                societe || "",
        "metadata[plan]":                                   selectedPlan.plan_id,
        "metadata[token_budget]":                           String(selectedPlan.token_budget),
        "success_url": `${baseUrl}/agent.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        "cancel_url":  `${baseUrl}/agent.html?payment=cancel`,
        "locale":      "fr",
      }).toString(),
    });

    if (!response.ok) {
      const err = await response.text();
      return res.status(400).json({ error: "Erreur Stripe : " + err });
    }

    const session = await response.json();
    return res.status(200).json({ url: session.url, sessionId: session.id });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
