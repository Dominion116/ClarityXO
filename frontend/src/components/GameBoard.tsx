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
      
      // Only update board if we get valid data (not all zeros for an active game with moves)
      const hasValidData = boardState && Array.isArray(boardState) && boardState.length === 9;
      
      if (hasValidData) {
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
      }
    } catch (error) {
      console.error('Error fetching game state:', error);
      // Don't update state on error - keep current board visible
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
          
          // Poll for updates more frequently initially
          let pollCount = 0;
          const checkInterval = setInterval(async () => {
            await fetchGameState();
            pollCount++;
            
            // Stop polling after 15 attempts (30 seconds)
            if (pollCount >= 15) {
              clearInterval(checkInterval);
              setLoading(false);
              setTxStatus('');
            }
          }, 2000);

          // Final refresh after longer timeout
          setTimeout(() => {
            clearInterval(checkInterval);
            setLoading(false);
            setTxStatus('');
            fetchGameState();
          }, 12000);
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
    setWinningLine(null); // Clear winning line immediately

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
          setWinningLine(null); // Clear again after transaction
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
    
    // Calculate the center row/col for each cell in a 3x3 grid (percentage based)
    // Row positions: 16.67%, 50%, 83.33% (center of each row)
    // Col positions: 16.67%, 50%, 83.33% (center of each column)
    
    // Horizontal lines
    if (a === 0 && b === 1 && c === 2) return { width: '90%', top: '16.67%', left: '50%', transform: 'translateX(-50%)' };
    if (a === 3 && b === 4 && c === 5) return { width: '90%', top: '50%', left: '50%', transform: 'translateX(-50%)' };
    if (a === 6 && b === 7 && c === 8) return { width: '90%', top: '83.33%', left: '50%', transform: 'translateX(-50%)' };
    
    // Vertical lines
    if (a === 0 && b === 3 && c === 6) return { width: '90%', top: '50%', left: '16.67%', transform: 'translateY(-50%) rotate(90deg)' };
    if (a === 1 && b === 4 && c === 7) return { width: '90%', top: '50%', left: '50%', transform: 'translateY(-50%) rotate(90deg)' };
    if (a === 2 && b === 5 && c === 8) return { width: '90%', top: '50%', left: '83.33%', transform: 'translateY(-50%) rotate(90deg)' };
    
    // Diagonals
    if (a === 0 && b === 4 && c === 8) return { width: '127%', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' };
    if (a === 2 && b === 4 && c === 6) return { width: '127%', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-45deg)' };
    
    return { width: '0%', top: '50%', left: '50%', transform: 'none' };
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
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute bg-neo-accent h-1 sm:h-1.5 rounded-full animate-pulse"
              style={{
                width: getLineStyle(winningLine).width,
                top: getLineStyle(winningLine).top,
                left: getLineStyle(winningLine).left,
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
