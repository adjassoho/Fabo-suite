import { useState } from 'react';
import { callAI } from '../services/api';
import { Loader2, Search, CheckCircle2, FileText, AlertCircle } from 'lucide-react';


const DeepResearch = () => {
  const [topic, setTopic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [step, setStep] = useState(0);

  const STEPS = [
    "Analyse de la requête",
    "Rédaction initiale de la recherche (IA)",
    "Traduction vers l'anglais",
    "Paraphrase et casse de structure IA",
    "Traduction de retour en français",
    "Vérification syntaxique finale"
  ];

  const handleResearch = async () => {
    if (!topic) return;
    
    setIsProcessing(true);
    setError('');
    setResult('');
    setStep(1);

    try {
      // Step 1: Initial Draft with Sources
      const sys1 = `Tu es un expert chercheur indépendant. Ton but est d'écrire un article complet, détaillé et structuré en français.
- NE FAIS AUCUNE PHRASE D'INTRODUCTION (ne dis pas "Voici l'article").
- À la toute fin, crée une section "Sources et Références" et fournis 3 à 5 sources RÉELLES ET PRÉCISES (titres de livres existants, auteurs connus, articles scientifiques ou sites web réels). N'utilise JAMAIS de texte fictif ou de placeholders comme "[Source 1]".`;
      const draftFr = await callAI(sys1, `Sujet de recherche : "${topic}"`);
      setStep(2);

      // Step 2: Translate FR -> EN & Burstiness Injection
      const sys2 = `You are an expert bilingual translator. Translate the text provided by the user into English.
- Rewrite it to sound like a passionate human expert.
- Use highly varied sentence lengths (burstiness).
- Use dynamic, non-predictable vocabulary (high perplexity).
- Do NOT use typical AI transitions (Furthermore, In conclusion).
- Keep the "Sources and References" section intact.
- OUTPUT ONLY THE TRANSLATED TEXT. NO INTRODUCTIONS. NO CHAT. NO COMMENTS.`;
      const draftEn = await callAI(sys2, draftFr);
      setStep(3);

      // Step 3: Deep Humanization Paraphrase
      const sys3 = `You are an expert copywriter who specializes in humanizing text. Rewrite the English text provided by the user to completely eliminate any remaining AI patterns.
- Inject human-like conversational nuances and an engaging flow.
- Ensure the structural rhythm is highly unpredictable.
- Keep the references intact at the end.
- OUTPUT ONLY THE REWRITTEN TEXT. NO INTRODUCTIONS. NO CHAT.`;
      const paraphrasedEn = await callAI(sys3, draftEn);
      setStep(4);

      // Step 4: Translate EN -> FR with Idiomatic Polish
      const sys4 = `Tu es un traducteur bilingue professionnel. Traduis le texte anglais fourni par l'utilisateur en français.
- La traduction doit être ultra-fluide et spontanée.
- Fuis le vocabulaire typique de l'IA (Cependant, En conclusion, Il convient de noter, En fin de compte).
- Conserve la section des sources à la fin.
- OUTPUT ONLY THE TRANSLATED TEXT. AUCUNE INTRODUCTION. AUCUN COMMENTAIRE.`;
      const paraphrasedFr = await callAI(sys4, paraphrasedEn);
      setStep(5);

      // Step 5: Final Syntax Check (No Fillers)
      const sys5 = `Tu es un correcteur professionnel natif français. Corrige la grammaire et l'orthographe du texte fourni.
- NE CHANGE PAS le style, ne lisse pas le texte. Garde son rythme original et humain.
- Assure-toi que la section des sources est présente.
- OUTPUT ONLY THE CORRECTED TEXT. NE DIS SURTOUT PAS "Voici la version corrigée". NE RÉPÈTE PAS LES CONSIGNES. COMMENCE DIRECTEMENT PAR LE TEXTE.`;
      const finalFr = await callAI(sys5, paraphrasedFr);
      
      setResult(finalFr);
      setStep(6);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de la recherche.");
      setStep(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-bold mb-2">Deep Research</h2>
        <p className="text-gray-400">Recherche approfondie et humanisation du contenu (Indétectable par l'IA).</p>
      </div>

      <div className="glass-panel p-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">Sujet de recherche</label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          className="input-field mb-4 resize-none"
          placeholder="Ex: L'impact de l'intelligence artificielle sur l'architecture moderne..."
          disabled={isProcessing}
        />
        <button 
          onClick={handleResearch} 
          disabled={!topic || isProcessing}
          className="btn-primary w-full flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              <span>Génération en cours...</span>
            </>
          ) : (
            <>
              <Search size={20} />
              <span>Lancer la recherche</span>
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start space-x-3 text-red-200">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Progress Indicators */}
      {isProcessing && (
        <div className="glass-panel p-6 flex-1">
          <h3 className="font-semibold mb-4 text-orange-400">Progression du Workflow (The Loop)</h3>
          <div className="space-y-4">
            {STEPS.map((s, idx) => {
              const isActive = step === idx + 1;
              const isDone = step > idx + 1;
              return (
                <div key={idx} className={`flex items-center space-x-3 ${isActive ? 'text-white' : isDone ? 'text-green-400' : 'text-gray-600'}`}>
                  {isDone ? <CheckCircle2 size={20} /> : isActive ? <Loader2 size={20} className="animate-spin text-orange-500" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-700" />}
                  <span className={isActive ? 'font-medium' : ''}>{s}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Results */}
      {!isProcessing && result && (
        <div className="glass-panel p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-orange-400 flex items-center space-x-2">
              <FileText size={20} />
              <span>Résultat Final (Humanisé)</span>
            </h3>
            <button 
              onClick={() => navigator.clipboard.writeText(result)}
              className="text-xs btn-secondary py-1 px-3"
            >
              Copier
            </button>
          </div>
          <div className="bg-dark-bg border border-gray-800 rounded-lg p-4 text-gray-200 whitespace-pre-wrap flex-1 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};

export default DeepResearch;
