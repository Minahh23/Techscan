// api/analyze.js — Vercel Serverless Function
// La clé API Anthropic est lue depuis les variables d'environnement Vercel
// Elle n'est JAMAIS exposée au navigateur

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Configuration serveur manquante. Ajoutez ANTHROPIC_API_KEY dans les variables d'environnement Vercel."
    });
  }

  const { systemPrompt, userPrompt } = req.body;

  if (!userPrompt || userPrompt.trim().length < 5) {
    return res.status(400).json({ error: "Texte d'annonce trop court ou manquant." });
  }

  try {
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    if (!anthropicRes.ok) {
      const errBody = await anthropicRes.json().catch(() => ({}));
      const status = anthropicRes.status;
      if (status === 401) return res.status(500).json({ error: 'Clé API invalide. Vérifiez ANTHROPIC_API_KEY dans Vercel.' });
      if (status === 429) return res.status(429).json({ error: 'Limite de requêtes atteinte. Réessayez dans quelques secondes.' });
      if (status === 529 || status === 503) return res.status(503).json({ error: 'Service temporairement indisponible. Réessayez.' });
      return res.status(500).json({ error: `Erreur API (${status}): ${errBody?.error?.message || 'Erreur inconnue'}` });
    }

    const data = await anthropicRes.json();
    const rawText = data.content.map(c => c.text || '').join('');
    const clean = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/g, '').trim();

    let result;
    try {
      result = JSON.parse(clean);
    } catch {
      const match = clean.match(/\{[\s\S]*\}/);
      if (match) {
        try { result = JSON.parse(match[0]); }
        catch { return res.status(500).json({ error: "La réponse de l'IA n'est pas un JSON valide. Réessayez." }); }
      } else {
        return res.status(500).json({ error: "Réponse inattendue de l'IA. Réessayez." });
      }
    }

    return res.status(200).json(result);

  } catch (err) {
    console.error('TechScan API error:', err);
    return res.status(500).json({ error: 'Erreur réseau interne.' });
  }
}
