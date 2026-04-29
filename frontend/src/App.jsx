import React, { useState, useCallback, useEffect } from "react";
import { uintCV, principalCV } from "@stacks/transactions";
import { CONFIG } from "./config";
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from "./utils/constants";
import { checkWinner, chooseAiMove, getWinningLine } from "./utils/gameLogic";
import { callReadOnly, parseGameStateFromClarityValue, parseUintResult, encodeCVArg } from "./utils/stacks";
import { recordResult } from "./utils/leaderboardLogic";
import './index.css';

import Landing from "./components/Landing";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";

export default function App() {
  const WALLET_STORAGE_KEY = "clarityxo.walletAddress";

  // "landing" | "game" | "leaderboard"
  const [activePage, setActivePage] = useState("landing");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [board, setBoard] = useState(Array(9).fill(EMPTY));
  const [status, setStatus] = useState(STATUS_ACTIVE);
  const [moveCount, setMoveCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [walletAddr, setWalletAddr] = useState(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(WALLET_STORAGE_KEY);
  });
  const [gameId, setGameId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
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

  const requestLeather = useCallback(async (method, params) => {
    const provider = window.LeatherProvider;
    if (!provider) throw new Error("Leather wallet not found");
    return provider.request(method, params);
  }, []);

  const getLeatherStxAddress = useCallback(async () => {
    const response = await requestLeather("getAddresses", { network: CONFIG.network });
    const stxAddress = response?.result?.addresses?.find((entry) => entry.symbol === "STX")?.address;
    if (!stxAddress) throw new Error("Could not find the active STX address in Leather");
    return stxAddress;
  }, [requestLeather]);

  const callLeatherContract = useCallback(async (functionName, functionArgs = []) => {
    return requestLeather("stx_callContract", {
      contract: `${CONFIG.contractAddress}.${CONFIG.contractName}`,
      functionName,
      functionArgs,
      network: CONFIG.network,
    });
  }, [requestLeather]);

  const syncChainState = useCallback(async (overrideWalletAddr = null) => {
    try {
      const activeWalletAddr = overrideWalletAddr || walletAddr;
      if (!activeWalletAddr) {
        log("Wallet not connected. Cannot sync chain state.", "error");
        return;
      }
      const activeGameRes = await callReadOnly("get-active-game", [encodeCVArg(principalCV(activeWalletAddr))]);
      const activeGameId = parseUintResult(activeGameRes);
      if (activeGameId === 0) {
        log("No active game found.", "info");
        setGameId(null);
        return;
      }
      setGameId(activeGameId);
      const fullGameRes = await callReadOnly("get-full-game-state", [encodeCVArg(uintCV(activeGameId))]);
      if (fullGameRes.result) {
        const parsedGame = parseGameStateFromClarityValue(fullGameRes);
        const chainBoard = parsedGame.board;
        const chainStatus = parsedGame.status || STATUS_ACTIVE;
        const chainMoves = parsedGame.moves || 0;
        setBoard(chainBoard);
        setStatus(chainStatus);
        setMoveCount(chainMoves);
        if (chainStatus !== STATUS_ACTIVE) setWinLine(getWinningLine(chainBoard));
        log("Chain state synced.", "success");
      }
    } catch (e) {
      log(`Sync failed: ${e.message}`, "error");
    }
  }, [log, walletAddr]);

  const startGame = useCallback(async () => {
    if (gameStarted || processing) return;
    if (!walletAddr) {
      log("Connect wallet to start a game.", "error");
      return;
    }
    try {
      setProcessing(true);
      const response = await callLeatherContract("start-game");
      setGameStarted(true);
      log(`Game started. TX: ${response?.result?.txid?.slice(0, 16)}…`, "success");
      setTimeout(syncChainState, 6000);
    } catch (e) {
      log(`Start game error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [gameStarted, processing, walletAddr, log, syncChainState, callLeatherContract]);

  const connectWallet = useCallback(async () => {
    try {
      if (!window.LeatherProvider) {
        log("No Stacks wallet detected. Install Leather (Hiro) wallet.", "error");
        return;
      }
      const addr = await getLeatherStxAddress();
      setWalletAddr(addr);
      window.localStorage.setItem(WALLET_STORAGE_KEY, addr);
      log(`Wallet connected: ${addr.slice(0, 12)}…`, "success");
    } catch (e) {
      log(`Wallet error: ${e.message}`, "error");
    }
  }, [log, getLeatherStxAddress]);

  useEffect(() => {
    if (!walletAddr) return;
    syncChainState(walletAddr);
  }, [walletAddr, syncChainState]);

  const makeMove = useCallback(async (idx) => {
    if (processing || status !== STATUS_ACTIVE) return;
    if (board[idx] !== EMPTY) return;
    const row = Math.floor(idx / 3);
    const col = idx % 3;
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
    let outcomeToRecord = null;
    if (statusAfterX !== STATUS_ACTIVE) {
      setStatus(statusAfterX);
      setWinLine(getWinningLine(nextBoard));
      let earned = 0;
      if (statusAfterX === STATUS_X_WON) {
        outcomeToRecord = "win";
        earned = 3;
        log(`You win! +${earned} pts earned.`, "success");
        showToast(earned, "Win");
      } else if (statusAfterX === STATUS_O_WON) {
        outcomeToRecord = "loss";
        earned = 0;
        log(`Computer wins. +${earned} pts.`, "error");
        showToast(earned, "Loss");
      } else if (statusAfterX === STATUS_DRAW) {
        outcomeToRecord = "draw";
        earned = 1;
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
    if (!gameStarted) {
      log("Game not started on-chain yet. Please click 'Start Game' first.", "error");
      return;
    }
    try {
      setProcessing(true);
      const response = await callLeatherContract("make-move", [encodeCVArg(uintCV(row)), encodeCVArg(uintCV(col))]);
      log(`TX broadcast: ${response?.result?.txid?.slice(0, 16)}…`, "success");
      if (outcomeToRecord) await recordResult(walletAddr, outcomeToRecord);
      setTimeout(syncChainState, 6000);
    } catch (e) {
      log(`TX error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [board, processing, status, gameStarted, walletAddr, log, syncChainState, callLeatherContract]);

  const resetLocal = useCallback(async () => {
    setBoard(Array(9).fill(EMPTY));
    setStatus(STATUS_ACTIVE);
    setMoveCount(0);
    setWinLine(null);
    setNewCells(new Set());
    setGameStarted(false);
    setGameId(null);
    log("Board reset locally. Starting new game on-chain...", "info");
    if (walletAddr) setTimeout(() => startGame(), 500);
  }, [log, walletAddr, startGame]);

  const resign = useCallback(async () => {
    if (!walletAddr) { log("Connect wallet to resign.", "error"); return; }
    try {
      setProcessing(true);
      const response = await callLeatherContract("resign-game");
      log(`Resigned. TX: ${response?.result?.txid?.slice(0, 16)}…`, "success");
      setStatus(STATUS_O_WON);
    } catch (e) {
      log(`Resign error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log, callLeatherContract]);

  return (
    <>
      {activePage === 'landing' && (
        <Landing onLaunch={() => setActivePage('game')} />
      )}
      {activePage !== 'landing' && (
        <>
          <header>
            <div className="header-left">
              <div className="logo" onClick={() => setActivePage('landing')}>Clarity<span>XO</span></div>
              <nav className="desktop-nav">
                <div className={`nav-item ${activePage === 'game' ? 'active' : ''}`} onClick={() => setActivePage('game')}>Game</div>
                <div className={`nav-item ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => setActivePage('leaderboard')}>Leaderboard</div>
              </nav>
            </div>
            <div className="header-right">
              <div className="badge">{CONFIG.network}</div>
              <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
            
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <nav className="mobile-nav">
                <div className={`nav-item mobile ${activePage === 'game' ? 'active' : ''}`} onClick={() => { setActivePage('game'); setMobileMenuOpen(false); }}>Game</div>
                <div className={`nav-item mobile ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => { setActivePage('leaderboard'); setMobileMenuOpen(false); }}>Leaderboard</div>
              </nav>
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
              startGame={startGame}
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
      )}
    </>
  );
}
