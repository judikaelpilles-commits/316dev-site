// api/save-contact.js
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
  // Gère tous les formats de clé privée
  const PRIVATE_KEY  = (process.env.GOOGLE_PRIVATE_KEY || "")
    .replace(/\\n/g, "\n")
    .replace(/^"|"$/g, "")
    .trim();

  if (!SHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("Variables manquantes:", { SHEET_ID: !!SHEET_ID, CLIENT_EMAIL: !!CLIENT_EMAIL, PRIVATE_KEY: !!PRIVATE_KEY });
    return res.status(500).json({ error: "Variables d'environnement manquantes" });
  }

  try {
    const token = await getGoogleToken(CLIENT_EMAIL, PRIVATE_KEY);

    // Détecte le nom de la première feuille
    const metaResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const meta = await metaResp.json();
    const sheetName = meta.sheets?.[0]?.properties?.title || "Sheet1";

    // Vérifie si en-tête existe
    const checkResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:G1`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const checkData = await checkResp.json();
    const hasHeader = checkData.values && checkData.values.length > 0;

    // Ajoute l'en-tête si première utilisation
    if (!hasHeader) {
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}!A1:G1?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ values: [["Date", "Nom", "Email", "Téléphone", "Société", "Source", "Statut"]] }),
        }
      );
    }

    // Ajoute le contact
    const date = new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
    const appendResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(sheetName)}!A:G:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ values: [[date, nom, email, tel || "", societe || "", source || "Agent web", "Nouveau lead"]] }),
      }
    );

    if (!appendResp.ok) {
      const err = await appendResp.text();
      throw new Error("Erreur ajout Sheets : " + err);
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("save-contact error:", err.message);
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

  const header  = b64({ alg: "RS256", typ: "JWT" });
  const body    = b64(payload);
  const sigInput = `${header}.${body}`;

  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----/g, "")
    .replace(/\s/g, "");

  const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8", binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false, ["sign"]
  );

  const sigBytes = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5", cryptoKey,
    new TextEncoder().encode(sigInput)
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
  if (!tokenData.access_token) throw new Error("Token Google impossible : " + JSON.stringify(tokenData));
  return tokenData.access_token;
}
