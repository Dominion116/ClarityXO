import React from 'react';
import { getUserData } from '../auth';
import { Wallet, LogOut } from 'lucide-react';

interface WalletConnectProps {
  isAuthenticated: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({
  isAuthenticated,
  onConnect,
  onDisconnect,
}) => {
  if (!isAuthenticated) {
    return (
      <button onClick={onConnect} className="neo-button flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        Connect Wallet
      </button>
    );
  }

  const userData = getUserData();
  const address = userData?.profile?.stxAddress?.testnet || '';
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : '';

  return (
    <div className="flex items-center gap-3">
      <div className="neo-inset px-4 py-2 text-sm font-mono text-neo-text">
        {truncatedAddress}
      </div>
      <button
        onClick={onDisconnect}
        className="neo-button flex items-center gap-2 !px-4"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WalletConnect;
