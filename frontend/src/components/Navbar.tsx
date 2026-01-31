import React from 'react';
import { Gamepad2, Github, FileText, Trophy } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  currentPage: 'game' | 'leaderboard';
  onNavigate: (page: 'game' | 'leaderboard') => void;
  WalletComponent: React.ComponentType<{
    isAuthenticated: boolean;
    onConnect: () => void;
    onDisconnect: () => void;
  }>;
}

const Navbar: React.FC<NavbarProps> = ({
  isAuthenticated,
  onConnect,
  onDisconnect,
  currentPage,
  onNavigate,
  WalletComponent,
}) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-neo-bg border-b border-neo-shadow-dark/20 overflow-x-hidden">
      <div className="neo-card !rounded-none !shadow-neo-sm">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo and Brand */}
            <button 
              onClick={() => onNavigate('game')}
              className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl shadow-neo-sm">
                <Gamepad2 className="w-5 h-5 sm:w-6 sm:h-6 text-neo-accent" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-neo-text">
                  ClarityXO
                </h1>
                <p className="hidden sm:block text-xs text-neo-text opacity-60">
                  Blockchain Tic-Tac-Toe
                </p>
              </div>
            </button>

            {/* Navigation Links - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <a
                href="https://github.com/Dominion116/ClarityXO"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-neo-text hover:text-neo-accent transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button
                onClick={() => onNavigate('game')}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  currentPage === 'game' ? 'text-neo-accent' : 'text-neo-text hover:text-neo-accent'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Play Game</span>
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className={`flex items-center gap-2 text-sm transition-colors ${
                  currentPage === 'leaderboard' ? 'text-neo-accent' : 'text-neo-text hover:text-neo-accent'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </button>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center gap-2 sm:gap-3">
              <WalletComponent
                isAuthenticated={isAuthenticated}
                onConnect={onConnect}
                onDisconnect={onDisconnect}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center justify-center gap-4 sm:gap-6 pb-3 pt-2 border-t border-neo-shadow-dark/10 mt-2">
            <a
              href="https://github.com/Dominion116/ClarityXO"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-xs text-neo-text hover:text-neo-accent transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>Code</span>
            </a>
            <button
              onClick={() => onNavigate('game')}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                currentPage === 'game' ? 'text-neo-accent' : 'text-neo-text hover:text-neo-accent'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Play</span>
            </button>
            <button
              onClick={() => onNavigate('leaderboard')}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                currentPage === 'leaderboard' ? 'text-neo-accent' : 'text-neo-text hover:text-neo-accent'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>Stats</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
