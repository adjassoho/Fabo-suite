import { NavLink } from 'react-router-dom';
import { Home, Settings } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-dark-surface border-r border-gray-800 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 pb-4">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
          Fabo-AI Suite
        </h1>
        <p className="text-xs text-gray-600 mt-1">Outils IA tout-en-un</p>
      </div>

      {/* Navigation principale */}
      <div className="px-4 mb-2 flex-1">
        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-2 mb-2">Navigation</p>
        <nav className="space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gradient-to-r from-orange-500/20 to-yellow-400/20 text-orange-400 border border-orange-500/50'
                  : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
              }`
            }
          >
            <Home size={20} />
            <span className="font-medium text-sm">Accueil</span>
          </NavLink>
        </nav>
      </div>

      {/* Paramètres en bas */}
      <div className="px-4 mb-4">
        <div className="border-t border-gray-800 mb-4" />
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-gradient-to-r from-orange-500/20 to-yellow-400/20 text-orange-400 border border-orange-500/50'
                : 'text-gray-400 hover:text-gray-100 hover:bg-gray-800'
            }`
          }
        >
          <Settings size={20} />
          <span className="font-medium text-sm">Paramètres</span>
        </NavLink>
      </div>

      {/* Footer */}
      <div className="p-4 text-xs text-gray-700 text-center border-t border-gray-800">
        &copy; 2026 Fabo-AI Suite
      </div>
    </div>
  );
};

export default Sidebar;

