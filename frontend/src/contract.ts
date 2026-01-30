import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from './config';

export async function getBoardState(): Promise<number[]> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-board-state',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    if (json.success && json.value && json.value.value) {
      return json.value.value.map((cell: { value: string }) => parseInt(cell.value));
    }
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  } catch (error) {
    console.error('Error fetching board state:', error);
    return [0, 0, 0, 0, 0, 0, 0, 0, 0];
  }
}

export async function getGameStatus(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-game-status',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    if (json.success && json.value) {
      return parseInt(json.value.value);
    }
    return 0;
  } catch (error) {
    console.error('Error fetching game status:', error);
    return 0;
  }
}

export async function getCurrentTurn(): Promise<number> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'get-current-turn',
      functionArgs: [],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    if (json.success && json.value) {
      return parseInt(json.value.value);
    }
    return 1;
  } catch (error) {
    console.error('Error fetching current turn:', error);
    return 1;
  }
}

export async function isValidMove(row: number, col: number): Promise<boolean> {
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'is-valid-move',
      functionArgs: [uintCV(row), uintCV(col)],
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });

    const json = cvToJSON(result);
    return json.success && json.value && json.value.value === true;
  } catch (error) {
    console.error('Error checking valid move:', error);
    return false;
  }
}
