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
    <div className="min-h-screen bg-neo-bg flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="neo-card mb-8 w-full max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl shadow-neo">
              <Gamepad2 className="w-8 h-8 text-neo-accent" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-neo-text">ClarityXO</h1>
              <p className="text-sm text-neo-text opacity-70">
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
        <div className="neo-card text-center max-w-md">
          <h2 className="text-2xl font-bold text-neo-text mb-4">
            Welcome to ClarityXO
          </h2>
          <p className="text-neo-text opacity-70 mb-6">
            Connect your Stacks wallet to start playing Tic-Tac-Toe on the
            blockchain. Each move requires a transaction signature!
          </p>
          <button onClick={handleConnect} className="neo-button w-full">
            Connect Wallet to Play
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-neo-text opacity-50">
        <p>Built with Clarity smart contracts on Stacks blockchain</p>
      </div>
    </div>
  );
}

export default App;
