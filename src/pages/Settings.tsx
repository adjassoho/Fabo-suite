import { useState, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import { Key, ExternalLink, Star } from 'lucide-react';

const Settings = () => {
  const { grokKey, huggingFaceKey, openRouterKey, setGrokKey, setHuggingFaceKey, setOpenRouterKey } = useSettingsStore();
  
  const [localGrok, setLocalGrok] = useState(grokKey);
  const [localHF, setLocalHF] = useState(huggingFaceKey);
  const [localOR, setLocalOR] = useState(openRouterKey);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalGrok(grokKey);
    setLocalHF(huggingFaceKey);
    setLocalOR(openRouterKey);
  }, [grokKey, huggingFaceKey, openRouterKey]);

  const handleSave = () => {
    setGrokKey(localGrok.trim());
    setHuggingFaceKey(localHF.trim());
    setOpenRouterKey(localOR.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-3xl font-bold mb-2">Paramètres</h2>
        <p className="text-gray-400">Configurez au moins une clé API pour utiliser Fabo-AI.</p>
      </div>

      {/* Grok — RECOMMENDED */}
      <div className="glass-panel p-6 space-y-4 border border-orange-500/40">
        <div className="flex items-center space-x-2">
          <Star size={18} className="text-orange-400 fill-orange-400" />
          <h3 className="font-semibold text-orange-300">Grok (xAI) — Recommandé</h3>
          <span className="ml-auto text-xs bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">Prioritaire</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Clé API xAI (Grok)</label>
          <input
            type="password"
            value={localGrok}
            onChange={(e) => setLocalGrok(e.target.value)}
            className="input-field font-mono"
            placeholder="xai-..."
          />
          <p className="mt-2 text-xs text-gray-500">
            <strong className="text-orange-400">$25 de crédits gratuits par mois</strong>. Créez votre clé sur{' '}
            <a href="https://console.x.ai" target="_blank" rel="noreferrer"
              className="text-orange-400 hover:underline inline-flex items-center gap-1">
              console.x.ai <ExternalLink size={10} />
            </a>
            {' '}→ "API Keys" → "Create API Key".
          </p>
        </div>
      </div>

      {/* HuggingFace — Fallback */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Key size={18} className="text-gray-400" />
          <h3 className="font-semibold text-gray-300">HuggingFace (Secours)</h3>
          <span className="ml-auto text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">Fallback #1</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Clé API HuggingFace</label>
          <input
            type="password"
            value={localHF}
            onChange={(e) => setLocalHF(e.target.value)}
            className="input-field font-mono"
            placeholder="hf_..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Gratuit. Obtenez un token "Read" sur{' '}
            <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noreferrer"
              className="text-orange-400 hover:underline inline-flex items-center gap-1">
              huggingface.co/settings/tokens <ExternalLink size={10} />
            </a>.
          </p>
        </div>
      </div>

      {/* OpenRouter — Last Resort */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Key size={18} className="text-gray-400" />
          <h3 className="font-semibold text-gray-300">OpenRouter (Dernier recours)</h3>
          <span className="ml-auto text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full border border-gray-700">Fallback #2</span>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Clé API OpenRouter</label>
          <input
            type="password"
            value={localOR}
            onChange={(e) => setLocalOR(e.target.value)}
            className="input-field font-mono"
            placeholder="sk-or-v1-..."
          />
          <p className="mt-2 text-xs text-gray-500">
            Obtenez une clé sur{' '}
            <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer"
              className="text-orange-400 hover:underline inline-flex items-center gap-1">
              openrouter.ai/keys <ExternalLink size={10} />
            </a>.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button onClick={handleSave} className="btn-primary">
          Enregistrer les clés
        </button>
        {saved && <span className="text-green-500 font-medium text-sm">✓ Paramètres enregistrés !</span>}
      </div>
    </div>
  );
};

export default Settings;
