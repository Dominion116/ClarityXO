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
      <button onClick={onConnect} className="neo-button flex items-center gap-2 text-sm px-3 py-2 sm:px-6 sm:py-3">
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">Connect Wallet</span>
        <span className="sm:hidden">Connect</span>
      </button>
    );
  }

  const userData = getUserData();
  const address = userData?.profile?.stxAddress?.testnet || '';
  const truncatedAddress = address
    ? `${address.slice(0, 4)}...${address.slice(-3)}`
    : '';

  return (
    <div className="flex items-center gap-2">
      <div className="neo-inset px-3 py-2 text-xs sm:text-sm font-mono text-neo-text">
        {truncatedAddress}
      </div>
      <button
        onClick={onDisconnect}
        className="neo-button flex items-center gap-2 !px-2 !py-2 sm:!px-3"
        title="Disconnect"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
};

export default WalletConnect;
