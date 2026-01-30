import { StacksTestnet } from '@stacks/network';

// Contract details
export const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Update with your deployed contract address
export const CONTRACT_NAME = 'tictactoe';

// Network configuration
export const NETWORK = new StacksTestnet();

// Game constants
export const EMPTY = 0;
export const PLAYER_X = 1;
export const PLAYER_O = 2;

export const STATUS_ACTIVE = 0;
export const STATUS_X_WON = 1;
export const STATUS_O_WON = 2;
export const STATUS_DRAW = 3;

// Cell display
export const CELL_DISPLAY = {
  [EMPTY]: '',
  [PLAYER_X]: 'X',
  [PLAYER_O]: 'O',
};

// Status display
export const STATUS_DISPLAY = {
  [STATUS_ACTIVE]: 'Game in Progress',
  [STATUS_X_WON]: 'You Win! 🎉',
  [STATUS_O_WON]: 'Computer Wins!',
  [STATUS_DRAW]: "It's a Draw!",
};
