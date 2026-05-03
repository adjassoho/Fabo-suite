import { useState } from 'react';
import { Bot, User, ArrowRight, Loader2, Copy, CheckCircle, RotateCcw } from 'lucide-react';
import { callAI } from '../services/api';

// ─── Nettoyage Markdown ──────────────────────────────────────────────────────
const stripMarkdown = (text: string): string => {
  return text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')   // ***bold italic***
    .replace(/\*\*(.*?)\*\*/g, '$1')        // **bold**
    .replace(/\*(.*?)\*/g, '$1')            // *italic*
    .replace(/__(.*?)__/g, '$1')            // __bold__
    .replace(/_(.*?)_/g, '$1')              // _italic_
    .replace(/~~(.*?)~~/g, '$1')            // ~~strikethrough~~
    .replace(/^#{1,6}\s+/gm, '')            // # headings
    .replace(/^[-*+]\s+/gm, '')             // - bullet points
    .replace(/^\d+\.\s+/gm, '')             // 1. numbered lists
    .replace(/^>\s+/gm, '')                 // > blockquotes
    .replace(/`{1,3}[^`]*`{1,3}/g, (m) =>  // `code` or ```code```
      m.replace(/`/g, ''))
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // [links](url)
    .replace(/\n{3,}/g, '\n\n')             // collapse excessive newlines
    .trim();
};

// ─── Prompts Système Avancés ─────────────────────────────────────────────────

const BASE_RULES = `RÈGLE CAPITALE — PRÉSERVATION DU CONTENU :
Tu DOIS conserver TOUTES les informations du texte original : noms propres, noms d'entreprises, noms de projets, technologies mentionnées, certifications, dates, chiffres, lieux, compétences techniques. Ne supprime, n'invente et ne remplace AUCUN fait. Tu ne changes QUE la façon dont les phrases sont formulées.

RÈGLES DE FORMAT :
- Texte brut uniquement. AUCUN markdown : pas de ** ni * ni # ni tirets ni listes numérotées.
- Écris en paragraphes continus.

RÈGLES DE STYLE ANTI-DÉTECTION :
- Évite ces expressions typiques de l'IA : "en conclusion", "il est important de noter", "il convient de souligner", "il est crucial", "il est essentiel", "par conséquent", "en fin de compte", "dans le but de", "force est de constater", "il va sans dire", "à l'ère de", "dans un monde où", "double expertise", "double casquette".
- Varie la longueur des phrases : mélange des phrases courtes (5-10 mots) avec des phrases plus développées (20-30 mots).
- Utilise la voix active autant que possible.
- Reformule chaque phrase avec des mots différents tout en gardant exactement la même information.
- Tu peux fusionner deux phrases courtes en une seule, ou découper une phrase longue en deux.
- Tu peux changer l'ordre des mots dans une phrase, mais garde le même ordre global des paragraphes et des idées.
- Utilise des connecteurs naturels et variés au lieu de toujours les mêmes : "d'ailleurs", "côté technique", "concrètement", "au passage".`;

const TONE_PROMPTS: Record<string, string> = {
  'Standard': `Tu es un relecteur humain. On te donne un texte qui sonne trop "robotique" ou trop "parfait". Ton travail : le réécrire pour qu'il sonne naturel, comme si un humain l'avait écrit directement, tout en gardant EXACTEMENT les mêmes informations, faits, noms et détails techniques.

${BASE_RULES}

STYLE :
- Professionnel et fluide, comme un bon rédacteur qui écrit naturellement.
- Commence parfois une phrase par "Et" ou "Mais" pour casser la rigidité.
- Varie les structures : ne commence pas chaque phrase par le sujet.

Retourne UNIQUEMENT le texte réécrit. Aucun commentaire, aucune explication avant ou après.`,

  'Académique': `Tu es un relecteur humain. On te donne un texte qui sonne trop "robotique" ou trop "parfait". Ton travail : le réécrire pour qu'il sonne naturel, comme si un humain l'avait écrit directement, tout en gardant EXACTEMENT les mêmes informations, faits, noms et détails techniques.

ATTENTION : le texte réécrit DOIT avoir la MÊME LONGUEUR que l'original. Ne résume PAS. Ne raccourcis PAS. Chaque paragraphe de l'original doit produire un paragraphe de longueur similaire dans ta version.

${BASE_RULES}

STYLE :
- Professionnel et fluide, avec un registre légèrement plus soutenu et formel.
- Commence parfois une phrase par "Et" ou "Mais" pour casser la rigidité.
- Varie les structures : ne commence pas chaque phrase par le sujet.
- Utilise "on" ou "nous" parfois au lieu de tournures impersonnelles.

Retourne UNIQUEMENT le texte réécrit. Aucun commentaire, aucune explication avant ou après.`,

  'Décontracté': `Tu es un relecteur humain. On te donne un texte qui sonne trop "robotique" ou trop "parfait". Ton travail : le réécrire pour qu'il sonne naturel, comme si un humain l'avait écrit directement, tout en gardant EXACTEMENT les mêmes informations, faits, noms et détails techniques.

ATTENTION : le texte réécrit DOIT avoir la MÊME LONGUEUR que l'original. Ne résume PAS. Ne raccourcis PAS. Chaque paragraphe de l'original doit produire un paragraphe de longueur similaire dans ta version.

${BASE_RULES}

STYLE :
- Professionnel et fluide, mais un peu plus détendu et direct.
- Commence parfois une phrase par "Et" ou "Mais" pour casser la rigidité.
- Varie les structures : ne commence pas chaque phrase par le sujet.
- Simplifie les formulations alambiquées quand c'est possible sans perdre le sens.
- Utilise "j'ai", "je suis" au lieu de tournures impersonnelles quand c'est approprié.

Retourne UNIQUEMENT le texte réécrit. Aucun commentaire, aucune explication avant ou après.`
};

const TextHumanizer = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [tone, setTone] = useState('Standard');
  const [passCount, setPassCount] = useState(0);

  const handleHumanize = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    setError('');
    setOutputText('');
    setCopied(false);
    setPassCount(0);

    const systemPrompt = TONE_PROMPTS[tone] || TONE_PROMPTS['Standard'];

    try {
      // ─── Passe 1 : Réécriture en préservant le contenu ───────────
      setPassCount(1);
      const pass1 = await callAI(
        systemPrompt,
        `Réécris le texte ci-dessous pour qu'il paraisse écrit par un humain. GARDE TOUTES les informations, tous les noms propres, projets, technologies et faits mentionnés. Change uniquement la formulation des phrases. Retourne UNIQUEMENT le texte réécrit :\n\n${inputText}`
      );
      const cleaned1 = stripMarkdown(pass1);

      // ─── Passe 2 : Polissage final ──────────────────────────────
      setPassCount(2);
      const pass2 = await callAI(
        systemPrompt,
        `Voici un texte qui doit encore paraître plus naturel. Reformule les phrases qui sonnent encore artificielles, varie un peu plus la longueur des phrases, mais NE CHANGE AUCUNE information, AUCUN nom, AUCUN fait. Retourne UNIQUEMENT le texte final :\n\n${cleaned1}`
      );
      const cleaned2 = stripMarkdown(pass2);

      setOutputText(cleaned2);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de l\'humanisation.');
    } finally {
      setIsLoading(false);
      setPassCount(0);
    }
  };

  const handleRehumanize = async () => {
    if (!outputText.trim()) return;

    setIsLoading(true);
    setError('');
    setCopied(false);
    setPassCount(1);

    const systemPrompt = TONE_PROMPTS[tone] || TONE_PROMPTS['Standard'];

    try {
      const result = await callAI(
        systemPrompt,
        `Ce texte doit encore être amélioré pour paraître plus humain. Reformule les phrases qui sonnent encore trop lisses ou trop "parfaites". GARDE TOUTES les informations intactes. Retourne UNIQUEMENT le texte :\n\n${outputText}`
      );
      setOutputText(stripMarkdown(result));
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setIsLoading(false);
      setPassCount(0);
    }
  };

  const handleCopy = () => {
    if (!outputText) return;
    navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadingMessage = passCount === 1
    ? 'Passe 1/2 — Réécriture en cours...'
    : passCount === 2
    ? 'Passe 2/2 — Humanisation finale...'
    : 'Traitement...';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <User className="text-orange-500" />
          Humanisateur de Texte IA
        </h2>
        <p className="text-gray-400">Rendez vos textes générés par l'IA indétectables et plus naturels.</p>
      </div>

      <div className="flex gap-4 items-center bg-dark-surface p-4 rounded-xl border border-gray-800">
        <span className="text-sm font-medium text-gray-300">Ton :</span>
        {['Standard', 'Académique', 'Décontracté'].map((t) => (
          <button
            key={t}
            onClick={() => setTone(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tone === t
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Entrée (Texte IA) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-gray-400">
            <span className="flex items-center gap-2">
              <Bot size={16} /> Texte généré par l'IA
            </span>
            <span>{inputText.length} caractères</span>
          </div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Collez ici le texte généré par ChatGPT, Claude, etc..."
            className="w-full h-[400px] bg-dark-surface border border-gray-800 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-orange-500/50 resize-none"
          />
        </div>

        {/* Sortie (Texte Humain) */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm font-medium text-gray-400">
            <span className="flex items-center gap-2 text-orange-400">
              <User size={16} /> Texte Humanisé
            </span>
            <div className="flex items-center gap-3">
              {outputText && (
                <button
                  onClick={handleRehumanize}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-orange-400 hover:text-orange-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Re-humaniser encore"
                >
                  <RotateCcw size={14} />
                  Ré-humaniser
                </button>
              )}
              <button 
                onClick={handleCopy}
                disabled={!outputText}
                className="flex items-center gap-1 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Copier le résultat"
              >
                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                {copied ? 'Copié !' : 'Copier'}
              </button>
            </div>
          </div>
          <div className="relative">
            <textarea
              readOnly
              value={outputText}
              placeholder="Le résultat humanisé apparaîtra ici..."
              className="w-full h-[400px] bg-dark-surface border border-gray-800 rounded-xl p-4 text-gray-200 focus:outline-none resize-none"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-dark-surface/50 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl">
                <Loader2 size={32} className="text-orange-500 animate-spin mb-2" />
                <p className="text-sm font-medium text-orange-400">{loadingMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleHumanize}
          disabled={!inputText.trim() || isLoading}
          className="btn-primary py-3 px-8 text-lg flex items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {loadingMessage}
            </>
          ) : (
            <>
              Humaniser le texte
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TextHumanizer;
