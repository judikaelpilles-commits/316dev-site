// api/get-contacts.js
// Récupère les contacts depuis Google Sheets
// Protégé par un mot de passe admin

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  // Vérification mot de passe admin
  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }

  const SHEET_ID     = process.env.GOOGLE_SHEET_ID;
  const CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
  const PRIVATE_KEY  = (process.env.GOOGLE_PRIVATE_KEY || "")
    .replace(/\\n/g, "\n").replace(/^"|"$/g, "").trim();

  try {
    const token = await getGoogleToken(CLIENT_EMAIL, PRIVATE_KEY);

    // Détecte le nom de la feuille
    const metaResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const meta = await metaResp.json();
    const sheetName = meta.sheets?.[0]?.properties?.title || "Sheet1";

    // Lit toutes les données
    const dataResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await dataResp.json();
    const rows = data.values || [];

    if (rows.length <= 1) return res.status(200).json({ contacts: [] });

    // Première ligne = en-têtes, reste = données
    const headers = rows[0];
    const contacts = rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => { obj[h] = row[i] || ""; });
      return obj;
    });

    return res.status(200).json({ contacts });

  } catch (err) {
    console.error("get-contacts error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

async function getGoogleToken(clientEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  };
  const b64 = str => btoa(unescape(encodeURIComponent(JSON.stringify(str))))
    .replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const header   = b64({ alg: "RS256", typ: "JWT" });
  const body     = b64(payload);
  const sigInput = `${header}.${body}`;
  const keyData  = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]
  );
  const sigBytes = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(sigInput)
  );
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBytes)))
    .replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_");
  const jwt = `${sigInput}.${sig}`;
  const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  const tokenData = await tokenResp.json();
  if (!tokenData.access_token) throw new Error("Token impossible : " + JSON.stringify(tokenData));
  return tokenData.access_token;
}
