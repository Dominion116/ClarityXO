import { useState, useEffect } from 'react';
import { isUserSignedIn, authenticate, disconnect } from './auth';
import GameBoard from './components/GameBoard';
import WalletConnect from './components/WalletConnect';
import { Gamepad2 } from 'lucide-react';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isUserSignedIn());
  }, []);

  const handleConnect = () => {
    authenticate();
  };

  const handleDisconnect = () => {
    disconnect();
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-neo-bg flex flex-col items-center py-4 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6">
      {/* Header */}
      <div className="neo-card mb-4 sm:mb-6 md:mb-8 w-full max-w-4xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 rounded-xl shadow-neo">
              <Gamepad2 className="w-6 h-6 sm:w-8 sm:h-8 text-neo-accent" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-neo-text">ClarityXO</h1>
              <p className="text-xs sm:text-sm text-neo-text opacity-70">
                Blockchain Tic-Tac-Toe on Stacks
              </p>
            </div>
          </div>
          
          <WalletConnect
            isAuthenticated={isAuthenticated}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
          />
        </div>
      </div>

      {/* Game Area */}
      {isAuthenticated ? (
        <GameBoard />
      ) : (
        <div className="neo-card text-center max-w-md w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-neo-text mb-3 sm:mb-4">
            Welcome to ClarityXO
          </h2>
          <p className="text-sm sm:text-base text-neo-text opacity-70 mb-4 sm:mb-6">
            Connect your Stacks wallet to start playing Tic-Tac-Toe on the
            blockchain. Each move requires a transaction signature!
          </p>
          <button onClick={handleConnect} className="neo-button w-full text-sm sm:text-base">
            Connect Wallet to Play
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 sm:mt-6 md:mt-8 text-center text-xs sm:text-sm text-neo-text opacity-50 px-4">
        <p>Built with Clarity smart contracts on Stacks blockchain</p>
      </div>
    </div>
  );
}

export default App;
