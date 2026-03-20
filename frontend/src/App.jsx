import React, { useState, useCallback } from "react";
import { CONFIG } from "./config";
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from "./utils/constants";
import { checkWinner, chooseAiMove, getWinningLine } from "./utils/gameLogic";
import { callReadOnly, parseBoardFromClarityValue, parseUintResult } from "./utils/stacks";
import { recordResult } from "./utils/leaderboardLogic";
import './index.css';

import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const [activePage, setActivePage] = useState("game");

  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [status, setStatus] = useState(STATUS_ACTIVE);
  const [moveCount, setMoveCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [walletAddr, setWalletAddr] = useState(null);
  const [logs, setLogs] = useState([]);
  const [newCells, setNewCells] = useState(new Set());
  const [winLine, setWinLine] = useState(null);
  const [toast, setToast] = useState({ show: false, pts: 0, reason: "" });

  const log = useCallback((msg, type = "info") => {
    setLogs(prev => [...prev.slice(-50), { msg, type, ts: Date.now() }]);
  }, []);

  const showToast = (pts, reason) => {
    setToast({ show: true, pts, reason });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2400);
  };

  const syncChainState = useCallback(async () => {
    try {
      const [boardRes, statusRes, movesRes] = await Promise.all([
        callReadOnly("get-board-state"),
        callReadOnly("get-game-status"),
        callReadOnly("get-moves-count"),
      ]);
      const chainBoard = parseBoardFromClarityValue(boardRes);
      const chainStatus = parseUintResult(statusRes);
      const chainMoves = parseUintResult(movesRes);
      setBoard(chainBoard);
      setStatus(chainStatus);
      setMoveCount(chainMoves);
      if (chainStatus !== STATUS_ACTIVE) {
        setWinLine(getWinningLine(chainBoard));
      }
    } catch (e) {
      log(`Sync failed: ${e.message}`, "error");
    }
  }, [log]);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.StacksProvider && !window.btc) {
        log("No Stacks wallet detected. Install Leather (Hiro) wallet.", "error");
        return;
      }
      const { showConnect } = await import("@stacks/connect");
      showConnect({
        appDetails: { name: "ClarityXO", icon: "" },
        onFinish: (data) => {
          const addr = data?.userSession?.loadUserData()?.profile?.stxAddress?.[CONFIG.network];
          setWalletAddr(addr || "connected");
          log(`Wallet connected: ${addr?.slice(0, 12)}…`, "success");
        },
        onCancel: () => log("Wallet connection cancelled.", "error"),
      });
    } catch (e) {
      log(`Wallet error: ${e.message}`, "error");
    }
  }, [log]);

  const makeMove = useCallback(async (idx) => {
    if (processing || status !== STATUS_ACTIVE) return;
    if (board[idx] !== EMPTY) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    // Optimistic update
    const nextBoard = [...board];
    nextBoard[idx] = PLAYER_X;

    let aiIdx = -1;
    let statusAfterX = STATUS_ACTIVE;
    const winnerAfterX = checkWinner(nextBoard);
    
    if (winnerAfterX === PLAYER_X) statusAfterX = STATUS_X_WON;
    else if (nextBoard.filter(c => c === EMPTY).length === 0) statusAfterX = STATUS_DRAW;

    const newSet = new Set([idx]);

    if (statusAfterX === STATUS_ACTIVE) {
      aiIdx = chooseAiMove(nextBoard);
      if (aiIdx !== -1) {
        nextBoard[aiIdx] = PLAYER_O;
        newSet.add(aiIdx);
        const winnerAfterO = checkWinner(nextBoard);
        if (winnerAfterO === PLAYER_O) statusAfterX = STATUS_O_WON;
        else if (nextBoard.filter(c => c === EMPTY).length === 0) statusAfterX = STATUS_DRAW;
      }
    }

    setBoard(nextBoard);
    setMoveCount(prev => prev + (aiIdx !== -1 ? 2 : 1));
    setNewCells(newSet);
    
    // Announce result
    if (statusAfterX !== STATUS_ACTIVE) {
      setStatus(statusAfterX);
      setWinLine(getWinningLine(nextBoard));
      
      let earned = 0;
      if (statusAfterX === STATUS_X_WON) {
        earned = recordResult(walletAddr, "win");
        log(`You win! +${earned} pts earned.`, "success");
        showToast(earned, "Win");
      } else if (statusAfterX === STATUS_O_WON) {
        earned = recordResult(walletAddr, "loss");
        log(`Computer wins. +${earned} pts.`, "error");
        showToast(earned, "Loss");
      } else if (statusAfterX === STATUS_DRAW) {
        earned = recordResult(walletAddr, "draw");
        log(`It's a draw. +${earned} pt.`, "info");
        showToast(earned, "Draw");
      }
    } else {
       const pos = (i) => `[${Math.floor(i/3)},${i%3}]`;
       log(`You played ${pos(idx)}. Computer replied ${aiIdx !== -1 ? pos(aiIdx) : "—"}.`, "info");
    }

    setTimeout(() => setNewCells(new Set()), 400);

    if (!walletAddr) {
      log("Move simulated locally. Connect wallet to play on-chain.", "info");
      return;
    }

    // Submit to chain
    try {
      setProcessing(true);
      const { openContractCall } = await import("@stacks/connect");
      const { uintCV } = await import("@stacks/transactions");
      const { StacksTestnet, StacksMainnet } = await import("@stacks/network");
      const network = CONFIG.network === "mainnet" ? new StacksMainnet() : new StacksTestnet();

      await openContractCall({
        network,
        contractAddress: CONFIG.contractAddress,
        contractName: CONFIG.contractName,
        functionName: "make-move",
        functionArgs: [uintCV(row), uintCV(col)],
        appDetails: { name: "ClarityXO", icon: "" },
        onFinish: (data) => {
          log(`TX broadcast: ${data.txId?.slice(0, 16)}…`, "success");
          setTimeout(syncChainState, 6000); // Wait a block
        },
        onCancel: () => log("Transaction cancelled.", "error"),
      });
    } catch (e) {
      log(`TX error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [board, processing, status, walletAddr, log, syncChainState]);

  const resetLocal = useCallback(() => {
    setBoard(Array(9).fill(EMPTY));
    setStatus(STATUS_ACTIVE);
    setMoveCount(0);
    setWinLine(null);
    setNewCells(new Set());
    log("Board reset locally. Note: on-chain state is unchanged.", "info");
  }, [log]);

  const resign = useCallback(async () => {
    if (!walletAddr) { log("Connect wallet to resign.", "error"); return; }
    try {
      setProcessing(true);
      const { openContractCall } = await import("@stacks/connect");
      const { StacksTestnet, StacksMainnet } = await import("@stacks/network");
      const network = CONFIG.network === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      
      await openContractCall({
        network,
        contractAddress: CONFIG.contractAddress,
        contractName: CONFIG.contractName,
        functionName: "resign-game",
        functionArgs: [],
        appDetails: { name: "ClarityXO", icon: "" },
        onFinish: (data) => {
          log(`Resigned. TX: ${data.txId?.slice(0, 16)}…`, "success");
          setStatus(STATUS_O_WON);
        },
        onCancel: () => log("Resign cancelled.", "error"),
      });
    } catch (e) {
      log(`Resign error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log]);

  return (
    <>
      <header>
        <div className="header-left">
          <div className="logo" onClick={() => setActivePage('game')}>Clarity<span>XO</span></div>
          <nav>
            <div className={`nav-item ${activePage === 'game' ? 'active' : ''}`} onClick={() => setActivePage('game')}>Game</div>
            <div className={`nav-item ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => setActivePage('leaderboard')}>Leaderboard</div>
          </nav>
        </div>
        <div className="header-right">
          <div className="badge">{CONFIG.network}</div>
        </div>
      </header>

      <div id="points-toast" className={toast.show ? 'show' : ''}>
        +<span className="pts">{toast.pts}</span> pts — <span>{toast.reason}</span>
      </div>

      {activePage === 'game' && (
        <Game
          board={board}
          status={status}
          moveCount={moveCount}
          processing={processing}
          walletAddr={walletAddr}
          logs={logs}
          newCells={newCells}
          winLine={winLine}
          syncChainState={syncChainState}
          connectWallet={connectWallet}
          makeMove={makeMove}
          resetLocal={resetLocal}
          resign={resign}
        />
      )}

      {activePage === 'leaderboard' && (
        <Leaderboard
          walletAddr={walletAddr}
          addLog={log}
          navigate={setActivePage}
        />
      )}
    </>
  );
}
