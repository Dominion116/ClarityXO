import React, { useState, useEffect, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { uintCV, PostConditionMode } from '@stacks/transactions';
import {
  CONTRACT_ADDRESS,
  CONTRACT_NAME,
  NETWORK,
  CELL_DISPLAY,
  STATUS_DISPLAY,
  PLAYER_X,
  STATUS_ACTIVE,
} from '../config';
import { getBoardState, getGameStatus, getCurrentTurn } from '../contract';
import { userSession } from '../auth';
import { RefreshCw, Loader2 } from 'lucide-react';

const GameBoard: React.FC = () => {
  const [board, setBoard] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [gameStatus, setGameStatus] = useState<number>(STATUS_ACTIVE);
  const [currentTurn, setCurrentTurn] = useState<number>(PLAYER_X);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string>('');

  const fetchGameState = useCallback(async () => {
    try {
      const [boardState, status, turn] = await Promise.all([
        getBoardState(),
        getGameStatus(),
        getCurrentTurn(),
      ]);
      setBoard(boardState);
      setGameStatus(status);
      setCurrentTurn(turn);
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, []);

  useEffect(() => {
    fetchGameState();
    const interval = setInterval(fetchGameState, 5000);
    return () => clearInterval(interval);
  }, [fetchGameState]);

  const handleCellClick = async (index: number) => {
    if (loading || gameStatus !== STATUS_ACTIVE || currentTurn !== PLAYER_X) {
      return;
    }

    if (board[index] !== 0) {
      setTxStatus('Cell already occupied!');
      setTimeout(() => setTxStatus(''), 2000);
      return;
    }

    const row = Math.floor(index / 3);
    const col = index % 3;

    setLoading(true);
    setTxStatus('Please sign the transaction in your wallet...');

    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'make-move',
        functionArgs: [uintCV(row), uintCV(col)],
        network: NETWORK,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          setTxStatus('Transaction submitted! Waiting for confirmation...');
          console.log('Transaction:', data.txId);
          
          // Poll for updates
          const checkInterval = setInterval(async () => {
            await fetchGameState();
          }, 2000);

          setTimeout(() => {
            clearInterval(checkInterval);
            setLoading(false);
            setTxStatus('');
            fetchGameState();
          }, 10000);
        },
        onCancel: () => {
          setLoading(false);
          setTxStatus('Transaction cancelled');
          setTimeout(() => setTxStatus(''), 2000);
        },
      });
    } catch (error) {
      console.error('Transaction error:', error);
      setLoading(false);
      setTxStatus('Transaction failed');
      setTimeout(() => setTxStatus(''), 2000);
    }
  };

  const handleNewGame = async () => {
    setLoading(true);
    setTxStatus('Starting new game...');

    try {
      await openContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'start-new-game',
        functionArgs: [],
        network: NETWORK,
        postConditionMode: PostConditionMode.Allow,
        onFinish: (data) => {
          console.log('New game transaction:', data.txId);
          setTxStatus('New game started!');
          setTimeout(() => {
            setLoading(false);
            setTxStatus('');
            fetchGameState();
          }, 3000);
        },
        onCancel: () => {
          setLoading(false);
          setTxStatus('');
        },
      });
    } catch (error) {
      console.error('New game error:', error);
      setLoading(false);
      setTxStatus('Failed to start new game');
      setTimeout(() => setTxStatus(''), 2000);
    }
  };

  const renderCell = (index: number) => {
    const value = board[index];
    const isEmpty = value === 0;
    const isClickable =
      isEmpty && gameStatus === STATUS_ACTIVE && currentTurn === PLAYER_X && !loading;

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!isClickable}
        className={`
          aspect-square rounded-2xl text-5xl font-bold
          transition-all duration-200
          ${isEmpty ? 'neo-inset' : 'shadow-neo'}
          ${isClickable ? 'hover:shadow-neo-inset-sm cursor-pointer' : 'cursor-not-allowed'}
          ${value === PLAYER_X ? 'text-neo-accent' : 'text-neo-text'}
        `}
      >
        {CELL_DISPLAY[value]}
      </button>
    );
  };

  return (
    <div className="neo-card max-w-md w-full">
      {/* Status Bar */}
      <div className="mb-6 text-center">
        <div className="neo-inset px-4 py-3 rounded-xl mb-4">
          <p className="text-lg font-semibold text-neo-text">
            {STATUS_DISPLAY[gameStatus]}
          </p>
          {gameStatus === STATUS_ACTIVE && (
            <p className="text-sm text-neo-text opacity-70 mt-1">
              {currentTurn === PLAYER_X ? "Your turn (X)" : "Computer's turn (O)"}
            </p>
          )}
        </div>

        {txStatus && (
          <div className="neo-inset px-4 py-2 rounded-xl flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <p className="text-sm text-neo-text">{txStatus}</p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderCell)}
      </div>

      {/* Controls */}
      <button
        onClick={handleNewGame}
        disabled={loading}
        className="neo-button w-full flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        New Game
      </button>
    </div>
  );
};

export default GameBoard;
