import { useNavigate } from 'react-router-dom';
import { Search, User, ExternalLink } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleOpenLink = async (url: string) => {
    try {
      await openUrl(url);
    } catch (err) {
      console.error('Failed to open link with Tauri opener:', err);
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const internalTools = [
    {
      title: 'Deep Research',
      description: 'Recherche approfondie propulsée par l\'IA pour vos documents et sujets.',
      icon: <Search className="w-8 h-8 text-orange-400" />,
      action: () => navigate('/research'),
      gradient: 'from-orange-500/20 to-yellow-400/20',
      border: 'border-orange-500/30 hover:border-orange-500',
    },
    {
      title: 'Humanisateur IA',
      description: 'Rendez vos textes générés par l\'IA indétectables et naturels.',
      icon: <User className="w-8 h-8 text-blue-400" />,
      action: () => navigate('/humanizer'),
      gradient: 'from-blue-500/20 to-cyan-400/20',
      border: 'border-blue-500/30 hover:border-blue-500',
    },
  ];

  const externalLinks = [
    {
      label: 'Perplexity AI',
      url: 'https://www.perplexity.ai/',
      emoji: '🧠',
      color: 'text-cyan-400',
    },
    {
      label: 'Gamma AI',
      url: 'https://gamma.app/',
      emoji: '📊',
      color: 'text-pink-400',
    },
    {
      label: 'Canva',
      url: 'https://www.canva.com',
      emoji: '🎨',
      color: 'text-purple-400',
    },
    {
      label: 'ZeroGPT',
      url: 'https://www.zerogpt.com',
      emoji: '🔍',
      color: 'text-blue-400',
    },
    {
      label: 'Google Flow',
      url: 'https://labs.google/fx/fr/tools/flow',
      emoji: '🎬',
      color: 'text-orange-400',
    },
  ];

  return (
    <div className="py-8 animate-fade-in">
      <header className="mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent mb-4">
          Bienvenue sur Fabo-AI Suite
        </h1>
        <p className="text-gray-400 text-lg">
          Sélectionnez un outil pour commencer votre travail.
        </p>
      </header>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Outils Principaux</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {internalTools.map((tool) => (
            <button
              key={tool.title}
              onClick={tool.action}
              className={`flex flex-col items-start p-8 rounded-2xl bg-dark-surface border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10 ${tool.border} bg-gradient-to-br ${tool.gradient} text-left group`}
            >
              <div className="mb-6 p-4 rounded-xl bg-gray-900/50 backdrop-blur-sm group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3 text-gray-100">{tool.title}</h3>
              <p className="text-gray-400 line-clamp-2">{tool.description}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Liens Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {externalLinks.map((link) => (
            <button
              key={link.url}
              onClick={() => handleOpenLink(link.url)}
              className="flex items-center justify-between p-4 rounded-xl bg-dark-surface border border-gray-800 hover:border-gray-600 hover:bg-gray-800/50 transition-colors group"
            >
              <span className="flex items-center gap-3 font-medium text-gray-300 group-hover:text-white transition-colors">
                <span className="text-2xl">{link.emoji}</span>
                {link.label}
              </span>
              <ExternalLink size={16} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
