import { useState, useEffect } from 'react';
import { isUserSignedIn, authenticate, disconnect } from './auth';
import GameBoard from './components/GameBoard';
import WalletConnect from './components/WalletConnect';
import Navbar from './components/Navbar';

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
    <div className="min-h-screen bg-neo-bg flex flex-col">
      {/* Navbar */}
      <Navbar
        isAuthenticated={isAuthenticated}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        WalletComponent={WalletConnect}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center py-6 sm:py-8 md:py-12 px-3 sm:px-4 md:px-6">
        {/* Game Area */}
        {isAuthenticated ? (
          <GameBoard />
        ) : (
          <div className="neo-card text-center max-w-md w-full mt-8">
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
        <div className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-neo-text opacity-50 px-4">
          <p>Built with Clarity smart contracts on Stacks blockchain</p>
          <p className="mt-2">Contract: ST30VGN68PSGVWGNMD0HH2WQMM5T486EK3WBNTHCY.ClarityXO</p>
        </div>
      </div>
    </div>
  );
}

export default App;
