export const CONFIG = {
  contractAddress: "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y",
  contractName: "clarity-xo-game",
  network: "mainnet",
  leaderboardApiBaseUrl: import.meta.env.VITE_LEADERBOARD_API_BASE_URL || "http://localhost:8787",
  nftContractAddress: "SP30VGN68PSGVWGNMD0HH2WQMM5T486EK3YGP7Z3Y",
  nftContractName: "clarity-xo-trophy",
};

export const CONTRACT_ADDRESS = CONFIG.contractAddress;
export const CONTRACT_NAME = CONFIG.contractName;
export const NETWORK = CONFIG.network;
