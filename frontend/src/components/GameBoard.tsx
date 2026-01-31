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
import { RefreshCw, Loader2 } from 'lucide-react';

const GameBoard: React.FC = () => {
  const [board, setBoard] = useState<number[]>([0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const [gameStatus, setGameStatus] = useState<number>(STATUS_ACTIVE);
  const [currentTurn, setCurrentTurn] = useState<number>(PLAYER_X);
  const [loading, setLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<string>('');
  const [winningLine, setWinningLine] = useState<number[] | null>(null);

  // Detect winning line from board state
  const detectWinningLine = useCallback((boardState: number[]) => {
    const lines = [
      [0, 1, 2], // row 0
      [3, 4, 5], // row 1
      [6, 7, 8], // row 2
      [0, 3, 6], // col 0
      [1, 4, 7], // col 1
      [2, 5, 8], // col 2
      [0, 4, 8], // diagonal
      [2, 4, 6], // diagonal
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        boardState[a] !== 0 &&
        boardState[a] === boardState[b] &&
        boardState[a] === boardState[c]
      ) {
        return line;
      }
    }
    return null;
  }, []);

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
      
      // Detect winning line if game is won
      if (status === 1 || status === 2) {
        const line = detectWinningLine(boardState);
        setWinningLine(line);
      } else {
        setWinningLine(null);
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
    }
  }, [detectWinningLine]);

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
    const isWinningCell = winningLine?.includes(index);

    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!isClickable}
        className={`
          aspect-square rounded-xl sm:rounded-2xl text-3xl sm:text-4xl md:text-5xl font-bold
          transition-all duration-200 relative
          ${isEmpty ? 'neo-inset' : 'shadow-neo'}
          ${isClickable ? 'hover:shadow-neo-inset-sm cursor-pointer active:scale-95' : 'cursor-not-allowed'}
          ${value === PLAYER_X ? 'text-neo-accent' : 'text-neo-text'}
          ${isWinningCell ? 'bg-neo-accent/10 ring-2 ring-neo-accent' : ''}
        `}
      >
        {CELL_DISPLAY[value as number]}
      </button>
    );
  };

  // Calculate line style based on winning combination
  const getLineStyle = (line: number[]) => {
    const [a, b, c] = line;
    
    // Horizontal lines
    if (a === 0 && b === 1 && c === 2) return { width: '80%', transform: 'translateY(-200%)' };
    if (a === 3 && b === 4 && c === 5) return { width: '80%', transform: 'translateY(0%)' };
    if (a === 6 && b === 7 && c === 8) return { width: '80%', transform: 'translateY(200%)' };
    
    // Vertical lines
    if (a === 0 && b === 3 && c === 6) return { width: '80%', transform: 'rotate(90deg) translateX(-200%)' };
    if (a === 1 && b === 4 && c === 7) return { width: '80%', transform: 'rotate(90deg)' };
    if (a === 2 && b === 5 && c === 8) return { width: '80%', transform: 'rotate(90deg) translateX(200%)' };
    
    // Diagonals
    if (a === 0 && b === 4 && c === 8) return { width: '115%', transform: 'rotate(45deg)' };
    if (a === 2 && b === 4 && c === 6) return { width: '115%', transform: 'rotate(-45deg)' };
    
    return { width: '0%', transform: 'none' };
  };

  return (
    <div className="neo-card max-w-md w-full">
      {/* Status Bar */}
      <div className="mb-4 sm:mb-6 text-center">
        <div className="neo-inset px-3 sm:px-4 py-2 sm:py-3 rounded-xl mb-3 sm:mb-4">
          <p className="text-base sm:text-lg font-semibold text-neo-text">
            {STATUS_DISPLAY[gameStatus as number]}
          </p>
          {gameStatus === STATUS_ACTIVE && (
            <p className="text-xs sm:text-sm text-neo-text opacity-70 mt-1">
              {currentTurn === PLAYER_X ? "Your turn (X)" : "Computer's turn (O)"}
            </p>
          )}
        </div>

        {txStatus && (
          <div className="neo-inset px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <p className="text-xs sm:text-sm text-neo-text">{txStatus}</p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 relative">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(renderCell)}
        
        {/* Winning Line Overlay */}
        {winningLine && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div 
              className="absolute bg-neo-accent h-1 sm:h-1.5 rounded-full animate-pulse"
              style={{
                width: getLineStyle(winningLine).width,
                transform: getLineStyle(winningLine).transform,
              }}
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <button
        onClick={handleNewGame}
        disabled={loading}
        className="neo-button w-full flex items-center justify-center gap-2 text-sm sm:text-base"
      >
        <RefreshCw className="w-4 h-4" />
        New Game
      </button>
    </div>
  );
};

export default GameBoard;
