// api/save-contact.js
// Sauvegarde un contact dans Google Sheets + envoie un email de notification

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { nom, email, societe, tel, source } = req.body || {};
  if (!nom || !email) return res.status(400).json({ error: "nom et email requis" });

  const SHEET_ID     = process.env.GOOGLE_SHEET_ID;
  const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
  const PRIVATE_KEY  = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  try {
    // ─── 1. Obtenir un token Google OAuth2 ──────────────
    const token = await getGoogleToken(CLIENT_EMAIL, PRIVATE_KEY);

    // ─── 2. Lire le nombre de lignes existantes ─────────
    const rangeCheck = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Feuille1!A:A`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const rangeData = await rangeCheck.json();
    const existingRows = rangeData.values?.length || 0;

    // ─── 3. Ajouter l'en-tête si première ligne ─────────
    if (existingRows === 0) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Feuille1!A1:G1?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            values: [["Date", "Nom", "Email", "Téléphone", "Société", "Source", "Statut"]]
          }),
        }
      );
    }

    // ─── 4. Ajouter le nouveau contact ──────────────────
    const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    const newRow = [date, nom, email, tel || "", societe || "", source || "Agent web", "Nouveau lead"];

    const appendResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Feuille1!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [newRow] }),
      }
    );

    if (!appendResp.ok) {
      const err = await appendResp.text();
      throw new Error("Sheets append error: " + err);
    }

    return res.status(200).json({ success: true, message: "Contact sauvegardé" });

  } catch (err) {
    console.error("save-contact error:", err);
    return res.status(500).json({ error: err.message });
  }
}

// ─── Génère un token JWT Google OAuth2 ────────────────
async function getGoogleToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };

  // Encode JWT header + payload
  const header  = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" })).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const body    = btoa(JSON.stringify(payload)).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const sigInput = `${header}.${body}`;

  // Signe avec la clé privée RSA
  const keyData = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const encoder  = new TextEncoder();
  const sigBytes = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, encoder.encode(sigInput));
  const sig      = btoa(String.fromCharCode(...new Uint8Array(sigBytes))).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");

  const jwt = `${sigInput}.${sig}`;

  // Échange le JWT contre un access token
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResp.json();
  if (!tokenData.access_token) throw new Error("Token Google impossible : " + JSON.stringify(tokenData));
  return tokenData.access_token;
}
