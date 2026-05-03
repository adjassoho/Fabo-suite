import { useSettingsStore } from '../store/settings';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getKeys = () => {
  const state = useSettingsStore.getState();
  return {
    openRouterKey: state.openRouterKey,
    huggingFaceKey: state.huggingFaceKey,
    grokKey: (state as any).grokKey ?? '',
  };
};

// ─── Generic OpenAI-Compatible Call ───────────────────────────────────────────

const callOpenAICompat = async (
  apiKey: string,
  baseUrl: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
  providerName: string
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 300000);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.78,
      }),
    });

    clearTimeout(timeoutId);

    if (response.status === 401 || response.status === 403) {
      throw new Error(`Clé API ${providerName} invalide ou expirée. Vérifiez dans les Paramètres.`);
    }

    if (!response.ok) {
      const text = await response.text();
      let msg = `${providerName} erreur ${response.status}`;
      try { msg = JSON.parse(text)?.error?.message ?? msg; } catch { /* noop */ }
      throw new Error(msg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error(`${providerName} n'a retourné aucun texte.`);
    return content;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      throw new Error(`Timeout (5 min). ${providerName} est surchargé. Réessayez.`);
    }
    throw err;
  }
};

// ─── Grok (xAI) — Recommandé, $25 crédits gratuits/mois ─────────────────────

export const callGrok = (systemPrompt: string, userPrompt: string): Promise<string> => {
  const { grokKey } = getKeys();
  if (!grokKey) throw new Error(
    "Clé API xAI (Grok) manquante.\n" +
    "→ Obtenez-la gratuitement sur console.x.ai\n" +
    "→ Collez-la dans les Paramètres de Fabo-AI."
  );
  return callOpenAICompat(grokKey, "https://api.x.ai/v1", "grok-3-mini", systemPrompt, userPrompt, "Grok");
};

// ─── OpenRouter (Secours avec clé payante) ────────────────────────────────────

export const callOpenRouter = async (
  systemPrompt: string,
  userPrompt: string,
  _model?: string
): Promise<string> => {
  return callAI(systemPrompt, userPrompt);
};

// ─── HuggingFace (Secours gratuit) ───────────────────────────────────────────

export const callHuggingFace = (systemPrompt: string, userPrompt: string): Promise<string> => {
  const { huggingFaceKey } = getKeys();
  if (!huggingFaceKey) throw new Error("Clé HuggingFace manquante.");
  // Use HF serverless router endpoint (supports many models)
  return callOpenAICompat(
    huggingFaceKey,
    "https://api-inference.huggingface.co/v1",
    "HuggingFaceH4/zephyr-7b-beta",
    systemPrompt,
    userPrompt,
    "HuggingFace"
  );
};

// ─── Smart callAI — essaie les providers dans l'ordre ─────────────────────────

export const callAI = async (systemPrompt: string, userPrompt: string): Promise<string> => {
  const { grokKey, huggingFaceKey, openRouterKey } = getKeys();
  const errors: string[] = [];

  // 1. Grok (xAI) — priorité si clé présente
  if (grokKey) {
    try {
      return await callGrok(systemPrompt, userPrompt);
    } catch (err: any) {
      if (err.message.includes("invalide") || err.message.includes("401") || err.message.includes("403")) {
        throw err; // Hard error — stop
      }
      errors.push(`Grok: ${err.message}`);
    }
  }

  // 2. HuggingFace — si clé présente
  if (huggingFaceKey) {
    try {
      return await callHuggingFace(systemPrompt, userPrompt);
    } catch (err: any) {
      if (err.message.includes("invalide") || err.message.includes("401") || err.message.includes("403")) {
        throw err;
      }
      errors.push(`HuggingFace: ${err.message}`);
    }
  }

  // 3. OpenRouter — si clé présente
  if (openRouterKey) {
    try {
      return await callOpenAICompat(
        openRouterKey,
        "https://openrouter.ai/api/v1",
        "openrouter/free",
        systemPrompt,
        userPrompt,
        "OpenRouter"
      );
    } catch (err: any) {
      errors.push(`OpenRouter: ${err.message}`);
    }
  }

  if (errors.length === 0) {
    throw new Error(
      "Aucune clé API configurée.\n" +
      "→ Allez dans les Paramètres\n" +
      "→ Ajoutez votre clé Grok (console.x.ai) — $25 gratuits/mois"
    );
  }

  throw new Error(
    "Tous les fournisseurs IA ont échoué :\n" + errors.join("\n")
  );
};

// ─── Google Translate (optionnel) ─────────────────────────────────────────────

export const translateText = async (text: string, targetLang: string, sourceLang = 'auto') => {
  const state = useSettingsStore.getState();
  const googleTranslateKey = (state as any).googleTranslateKey ?? '';
  if (!googleTranslateKey) throw new Error("Google Translate API key is missing");

  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${googleTranslateKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang !== 'auto' ? sourceLang : undefined,
        format: 'text',
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || "Translation failed");
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
};
