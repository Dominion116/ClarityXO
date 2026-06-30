import React, { useState, useCallback, useEffect, useRef } from "react";
import { uintCV, principalCV } from "@stacks/transactions";
import { connect, request } from "@stacks/connect";
import { CONFIG } from "./config";
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from "./utils/constants";
import { checkWinner, chooseAiMove, getWinningLine } from "./utils/gameLogic";
import { callReadOnly, parseGameStateFromClarityValue, parseUintResult, encodeCVArg, hasPendingChallenge } from "./utils/stacks";
import { recordResult } from "./utils/leaderboardLogic";
import { createChallenge, acceptChallenge, declineChallenge, cancelChallenge, makePvPMove, recordPvPResult, syncPvPGameState, fetchPendingChallenge, createRematch, fetchIncomingChallenges } from "./utils/pvp";
import { useRematch } from "./hooks/useRematch";
import { parseReferralCodeFromUrl, claimReferral } from "./utils/referral";
import ErrorBoundary from "./components/ErrorBoundary";
import { GAME_MODE_AI, GAME_MODE_PVP } from "./utils/constants";
import './index.css';
import './styles/refresh.css';

import Landing from "./components/Landing";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";
import PvPLobby from "./components/PvPLobby";
import NFTGallery from "./components/NFTGallery";
import SpectatorLobby from "./components/SpectatorLobby";
import TermsOfService from "./components/TermsOfService";
import PrivacyPolicy from "./components/PrivacyPolicy";
import { useTheme } from "./hooks/useTheme";
import Tutorial from "./components/Tutorial";
import { useTutorial } from "./hooks/useTutorial";

export default function App() {
  const WALLET_STORAGE_KEY = "clarityxo.walletAddress";
  const { theme, toggleTheme } = useTheme();

  // "landing" | "game" | "leaderboard" | "pvp"
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

  const { rematchState, sendRematch, clearRematch } = useRematch(walletAddr);
  const { isActive: tutorialActive, step: tutorialStep, currentStep: tutorialCurrentStep, totalSteps: tutorialTotalSteps, next: tutorialNext, prev: tutorialPrev, skip: tutorialSkip, restart: tutorialRestart } = useTutorial();
  const [gameId, setGameId] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [newCells, setNewCells] = useState(new Set());
  const [winLine, setWinLine] = useState(null);
  const [toast, setToast] = useState({ show: false, pts: 0, reason: "" });
  const [difficulty, setDifficulty] = useState('medium');
  const [gameTime, setGameTime] = useState(0);
  const timerRef = useRef(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(null);

  const [gameMode, setGameMode] = useState(GAME_MODE_AI);
  const [pvpOpponent, setPvpOpponent] = useState(null);
  const [pvpTurn, setPvpTurn] = useState(PLAYER_X);
  const [pvpOutboundChallenge, setPvpOutboundChallenge] = useState(null);
  const [incomingChallengeCount, setIncomingChallengeCount] = useState(0);

  // null | "pending" | "confirmed" | "dropped"
  const [txStatus, setTxStatus] = useState(null);
  const txStatusTimerRef = useRef(null);
  const pvpPollingRef = useRef(null);

  const setTxStatusWithAutoClear = useCallback((status, clearAfterMs = 4000) => {
    if (txStatusTimerRef.current) clearTimeout(txStatusTimerRef.current);
    setTxStatus(status);
    if (status === 'confirmed' || status === 'dropped') {
      txStatusTimerRef.current = setTimeout(() => setTxStatus(null), clearAfterMs);
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => setGameTime(t => t + 1), 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stepBack = useCallback(() => {
    setHistoryStep(prev => {
      const current = prev ?? moveHistory.length;
      return Math.max(0, current - 1);
    });
  }, [moveHistory.length]);

  const stepForward = useCallback(() => {
    setHistoryStep(prev => {
      if (prev === null) return null;
      const next = prev + 1;
      return next >= moveHistory.length ? null : next;
    });
  }, [moveHistory.length]);

  const log = useCallback((msg, type = "info") => {
    setLogs(prev => [...prev.slice(-50), { msg, type, ts: Date.now() }]);
  }, []);

  const showToast = (pts, reason) => {
    setToast({ show: true, pts, reason });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 2400);
  };

  const callContract = useCallback(async (functionName, functionArgs = []) => {
    return request("stx_callContract", {
      contract: `${CONFIG.contractAddress}.${CONFIG.contractName}`,
      functionName,
      functionArgs,
      network: CONFIG.network,
    });
  }, []);

  const syncChainState = useCallback(async (overrideWalletAddr = null, boardSnapshot = null) => {
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
        if (boardSnapshot) setTxStatusWithAutoClear('dropped');
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

        if (boardSnapshot) {
          const advanced = chainBoard.some((cell, i) => cell !== boardSnapshot[i]);
          setTxStatusWithAutoClear(advanced ? 'confirmed' : 'dropped');
        }

        log("Chain state synced.", "success");
      }
    } catch (e) {
      log(`Sync failed: ${e.message}`, "error");
      if (boardSnapshot) setTxStatusWithAutoClear('dropped');
    }
  }, [log, walletAddr, setTxStatusWithAutoClear]);

  const startGame = useCallback(async () => {
    if (gameStarted || processing) return;
    if (!walletAddr) {
      log("Connect wallet to start a game.", "error");
      return;
    }
    try {
      setProcessing(true);
      const response = await callContract("start-game");
      setGameStarted(true);
      log(`Game started. TX: ${response?.txid?.slice(0, 16)}…`, "success");
      setTimeout(syncChainState, 6000);
    } catch (e) {
      log(`Start game error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [gameStarted, processing, walletAddr, log, syncChainState, callContract]);

  const connectWallet = useCallback(async () => {
    try {
      const result = await connect();
      if (!result?.addresses?.length) throw new Error("No addresses returned from wallet");
      const stxAddr = result.addresses.find(a => a.symbol === "STX")?.address
                      ?? result.addresses[0]?.address;
      if (!stxAddr) throw new Error("No STX address returned");
      setWalletAddr(stxAddr);
      window.localStorage.setItem(WALLET_STORAGE_KEY, stxAddr);
      log(`Wallet connected: ${stxAddr.slice(0, 12)}…`, "success");
    } catch (e) {
      log(`Wallet error: ${e.message}`, "error");
    }
  }, [log]);

  const disconnectWallet = useCallback(() => {
    setWalletAddr(null);
    window.localStorage.removeItem(WALLET_STORAGE_KEY);
    log("Wallet disconnected", "success");
  }, [log]);

  useEffect(() => {
    if (!walletAddr) return;
    syncChainState(walletAddr);
  }, [walletAddr, syncChainState]);

  // Auto-claim referral bonus when wallet connects and ?ref= param is present
  useEffect(() => {
    if (!walletAddr) return;
    const refCode = parseReferralCodeFromUrl();
    if (!refCode) return;
    const CLAIMED_KEY = `clarityxo.refClaimed.${walletAddr}`;
    if (localStorage.getItem(CLAIMED_KEY)) return;
    // Resolve code to referrer, then credit
    fetch(`${CONFIG.leaderboardApiBaseUrl}/api/referral/${encodeURIComponent(refCode)}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.referrer || data.referrer === walletAddr) return;
        return claimReferral(data.referrer, walletAddr);
      })
      .then(result => {
        if (result?.ok && !result.alreadyClaimed) {
          localStorage.setItem(CLAIMED_KEY, 'true');
          log(`Referral bonus: your inviter earned +5 pts. Thanks for joining!`, 'success');
        }
      })
      .catch(() => {});
  }, [walletAddr]);

  useEffect(() => {
    if (!walletAddr) {
      setIncomingChallengeCount(0);
      if (pvpPollingRef.current) clearInterval(pvpPollingRef.current);
      return;
    }

    const pollForChallenges = async () => {
      try {
        const challenges = await fetchIncomingChallenges(walletAddr);
        setIncomingChallengeCount(challenges.length);
      } catch (error) {
        console.error('Error polling challenges:', error);
      }
    };

    pollForChallenges();
    pvpPollingRef.current = setInterval(pollForChallenges, 5000);

    return () => {
      if (pvpPollingRef.current) clearInterval(pvpPollingRef.current);
    };
  }, [walletAddr]);

  // While waiting for someone to respond to a challenge we sent, poll the chain
  // directly to find out the moment they accept (or decline) it.
  useEffect(() => {
    if (!walletAddr || !pvpOutboundChallenge) return;

    let cancelled = false;
    const pollOutboundChallenge = async () => {
      try {
        const activeGameRes = await callReadOnly("get-active-game", [encodeCVArg(principalCV(walletAddr))]);
        const activeGameId = parseUintResult(activeGameRes);
        if (cancelled) return;

        if (activeGameId > 0) {
          setGameMode(GAME_MODE_PVP);
          setPvpOpponent(pvpOutboundChallenge);
          setPvpTurn(PLAYER_X);
          setGameStarted(true);
          setGameId(activeGameId);
          log(`${pvpOutboundChallenge.slice(0, 12)}… accepted your challenge!`, "success");
          setPvpOutboundChallenge(null);
          await syncChainState();
          return;
        }

        const challengeRes = await callReadOnly("get-challenge", [encodeCVArg(principalCV(walletAddr))]);
        if (cancelled) return;
        if (!hasPendingChallenge(challengeRes)) {
          log("Your challenge was declined.", "info");
          setPvpOutboundChallenge(null);
        }
      } catch (e) {
        // Transient read failure — try again on the next tick.
      }
    };

    pollOutboundChallenge();
    const interval = setInterval(pollOutboundChallenge, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [walletAddr, pvpOutboundChallenge, log, syncChainState]);

  const makeMove = useCallback(async (idx) => {
    if (processing || status !== STATUS_ACTIVE) return;
    if (board[idx] !== EMPTY) return;
    startTimer();
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    const nextBoard = [...board];
    nextBoard[idx] = PLAYER_X;
    const coord = (i) => `[${Math.floor(i/3)},${i%3}]`;
    const newEntries = [{ player: 'X', idx, coord: coord(idx), boardAfter: [...nextBoard] }];
    let aiIdx = -1;
    let statusAfterX = STATUS_ACTIVE;
    const winnerAfterX = checkWinner(nextBoard);
    if (winnerAfterX === PLAYER_X) statusAfterX = STATUS_X_WON;
    else if (nextBoard.filter(c => c === EMPTY).length === 0) statusAfterX = STATUS_DRAW;
    const newSet = new Set([idx]);
    if (statusAfterX === STATUS_ACTIVE) {
      aiIdx = chooseAiMove(nextBoard, difficulty);
      if (aiIdx !== -1) {
        nextBoard[aiIdx] = PLAYER_O;
        newEntries.push({ player: 'O', idx: aiIdx, coord: coord(aiIdx), boardAfter: [...nextBoard] });
        newSet.add(aiIdx);
        const winnerAfterO = checkWinner(nextBoard);
        if (winnerAfterO === PLAYER_O) statusAfterX = STATUS_O_WON;
        else if (nextBoard.filter(c => c === EMPTY).length === 0) statusAfterX = STATUS_DRAW;
      }
    }
    setBoard(nextBoard);
    setMoveCount(prev => prev + (aiIdx !== -1 ? 2 : 1));
    setNewCells(newSet);
    setMoveHistory(prev => [...prev, ...newEntries]);
    let outcomeToRecord = null;
    if (statusAfterX !== STATUS_ACTIVE) {
      stopTimer();
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
      const boardSnapshot = [...board];
      const response = await callContract("make-move", [encodeCVArg(uintCV(row)), encodeCVArg(uintCV(col))]);
      log(`TX broadcast: ${response?.txid?.slice(0, 16)}…`, "success");
      setTxStatusWithAutoClear('pending', 999999);
      if (outcomeToRecord) await recordResult(walletAddr, outcomeToRecord);
      setTimeout(() => syncChainState(null, boardSnapshot), 6000);
    } catch (e) {
      log(`TX error: ${e.message}`, "error");
      setTxStatusWithAutoClear(null);
    } finally {
      setProcessing(false);
    }
  }, [board, processing, status, gameStarted, walletAddr, difficulty, startTimer, stopTimer, log, syncChainState, callContract]);

  const resetLocal = useCallback(async () => {
    stopTimer();
    setGameTime(0);
    setMoveHistory([]);
    setHistoryStep(null);
    setBoard(Array(9).fill(EMPTY));
    setStatus(STATUS_ACTIVE);
    setMoveCount(0);
    setWinLine(null);
    setNewCells(new Set());
    setGameStarted(false);
    setGameId(null);
    log("Board reset locally. Starting new game on-chain...", "info");
    if (walletAddr) setTimeout(() => startGame(), 500);
  }, [log, walletAddr, startGame, stopTimer]);

  const createPvPChallenge = useCallback(async (opponentAddr) => {
    if (!walletAddr) { log("Connect wallet to challenge someone.", "error"); return; }
    try {
      setProcessing(true);
      const response = await createChallenge(opponentAddr);
      setPvpOutboundChallenge(opponentAddr);
      log(`Challenge sent to ${opponentAddr.slice(0, 12)}… TX: ${response?.txid?.slice(0, 16)}…`, "success");
    } catch (e) {
      log(`Challenge error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log]);

  const acceptPvPChallenge = useCallback(async (challengerAddr) => {
    if (!walletAddr) { log("Connect wallet to accept a challenge.", "error"); return; }
    try {
      setProcessing(true);
      const response = await acceptChallenge(challengerAddr);
      setGameMode(GAME_MODE_PVP);
      setPvpOpponent(challengerAddr);
      setPvpTurn(PLAYER_X);
      setGameStarted(true);
      log(`Accepted challenge from ${challengerAddr.slice(0, 12)}… TX: ${response?.txid?.slice(0, 16)}…`, "success");
      setTimeout(syncChainState, 6000);
    } catch (e) {
      log(`Accept challenge error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log, syncChainState]);

  const declinePvPChallenge = useCallback(async (challengerAddr) => {
    if (!walletAddr) return;
    try {
      setProcessing(true);
      await declineChallenge(challengerAddr);
      log(`Declined challenge from ${challengerAddr.slice(0, 12)}…`, "info");
    } catch (e) {
      log(`Decline error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log]);

  const cancelPvPChallenge = useCallback(async () => {
    if (!walletAddr) return;
    try {
      setProcessing(true);
      await cancelChallenge();
      setPvpOutboundChallenge(null);
      log("Challenge cancelled.", "info");
    } catch (e) {
      log(`Cancel error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log]);

  const makePvPMoveHandler = useCallback(async (idx) => {
    if (processing || status !== STATUS_ACTIVE) return;
    if (board[idx] !== EMPTY) return;
    if (!walletAddr) { log("Connect wallet to play.", "error"); return; }
    const row = Math.floor(idx / 3);
    const col = idx % 3;
    startTimer();
    try {
      setProcessing(true);
      const response = await makePvPMove(row, col);
      log(`PvP move at [${row},${col}] TX: ${response?.txid?.slice(0, 16)}…`, "success");
      setTimeout(async () => {
        await syncChainState();
      }, 6000);
    } catch (e) {
      log(`PvP move error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [board, processing, status, walletAddr, startTimer, log, syncChainState]);

  const syncPvPState = useCallback(async () => {
    if (!gameId || gameMode !== GAME_MODE_PVP) return;
    try {
      const data = await syncPvPGameState(gameId);
      if (!data) return;
      await syncChainState();
    } catch (e) {
      log(`PvP sync error: ${e.message}`, "error");
    }
  }, [gameId, gameMode, syncChainState, log]);

  const resign = useCallback(async () => {
    if (!walletAddr) { log("Connect wallet to resign.", "error"); return; }
    try {
      setProcessing(true);
      const response = await callContract("resign-game");
      log(`Resigned. TX: ${response?.txid?.slice(0, 16)}…`, "success");
      setStatus(STATUS_O_WON);
    } catch (e) {
      log(`Resign error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log, callContract]);

  return (
    <>
      {activePage === 'landing' && (
        <Landing
          onLaunch={() => setActivePage('game')}
          onLeaderboard={() => setActivePage('leaderboard')}
          navigate={setActivePage}
        />
      )}
      {activePage === 'terms' && (
        <TermsOfService navigate={setActivePage} />
      )}
      {activePage === 'privacy' && (
        <PrivacyPolicy navigate={setActivePage} />
      )}
      {(activePage === 'game' || activePage === 'leaderboard' || activePage === 'pvp' || activePage === 'gallery' || activePage === 'spectate') && (
        <>
          <header>
            <div className="header-left">
              <div className="logo" onClick={() => setActivePage('landing')}>Clarity<span>XO</span></div>
              <nav className="desktop-nav">
                <div className={`nav-item ${activePage === 'game' ? 'active' : ''}`} onClick={() => setActivePage('game')}>Game</div>
                <div className={`nav-item ${activePage === 'pvp' ? 'active' : ''}`} onClick={() => setActivePage('pvp')}>
                  PvP
                  {incomingChallengeCount > 0 && (
                    <span className="nav-badge" title={`${incomingChallengeCount} incoming challenge${incomingChallengeCount !== 1 ? 's' : ''}`}>
                      {incomingChallengeCount}
                    </span>
                  )}
                </div>
                <div className={`nav-item ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => setActivePage('leaderboard')}>Leaderboard</div>
                <div className={`nav-item ${activePage === 'gallery' ? 'active' : ''}`} onClick={() => setActivePage('gallery')}>Trophies</div>
              </nav>
            </div>
            <div className="header-right">
              <button
                className="ghost-btn"
                onClick={tutorialRestart}
                title="Show tutorial"
                aria-label="Show tutorial"
                style={{ padding: '5px 9px', fontSize: 13 }}
              >
                ?
              </button>
              <button
                className="ghost-btn theme-toggle-btn"
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? '☀' : '☽'}
              </button>
              <div className="badge">{CONFIG.network}</div>
              {walletAddr ? (
                <div className="wallet-group">
                  <div className="badge" style={{ color: 'var(--green)', borderColor: 'var(--green)' }}>
                    {`${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}`}
                  </div>
                  <button className="ghost-btn" onClick={disconnectWallet}>
                    Logout
                  </button>
                </div>
              ) : (
                <button className="ghost-btn" onClick={connectWallet}>
                  Connect
                </button>
              )}
              <button className="hamburger-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? '✕' : '☰'}
                {incomingChallengeCount > 0 && (
                  <span
                    className="hamburger-dot"
                    title={`${incomingChallengeCount} incoming challenge${incomingChallengeCount !== 1 ? 's' : ''}`}
                  />
                )}
              </button>
            </div>
            
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
              <nav className="mobile-nav">
                <div className={`nav-item mobile ${activePage === 'game' ? 'active' : ''}`} onClick={() => { setActivePage('game'); setMobileMenuOpen(false); }}>Game</div>
                <div className={`nav-item mobile ${activePage === 'pvp' ? 'active' : ''}`} onClick={() => { setActivePage('pvp'); setMobileMenuOpen(false); }}>
                  PvP Lobby
                  {incomingChallengeCount > 0 && (
                    <span className="nav-badge" title={`${incomingChallengeCount} incoming challenge${incomingChallengeCount !== 1 ? 's' : ''}`}>
                      {incomingChallengeCount}
                    </span>
                  )}
                </div>
                <div className={`nav-item mobile ${activePage === 'leaderboard' ? 'active' : ''}`} onClick={() => { setActivePage('leaderboard'); setMobileMenuOpen(false); }}>Leaderboard</div>
                <div className={`nav-item mobile ${activePage === 'gallery' ? 'active' : ''}`} onClick={() => { setActivePage('gallery'); setMobileMenuOpen(false); }}>Trophies</div>
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
              gameTime={gameTime}
              moveHistory={moveHistory}
              historyStep={historyStep}
              onStepBack={stepBack}
              onStepForward={stepForward}
              onExitReplay={() => setHistoryStep(null)}
              difficulty={difficulty}
              onDifficultyChange={setDifficulty}
              syncChainState={syncChainState}
              connectWallet={connectWallet}
              startGame={startGame}
              makeMove={makeMove}
              resetLocal={resetLocal}
              resign={resign}
              gameMode={gameMode}
              pvpOpponent={pvpOpponent}
              pvpTurn={pvpTurn}
              makePvPMoveHandler={makePvPMoveHandler}
              txStatus={txStatus}
              onRematch={sendRematch}
            />
          )}

          {activePage === 'leaderboard' && (
            <Leaderboard
              walletAddr={walletAddr}
              addLog={log}
              navigate={setActivePage}
            />
          )}

          {activePage === 'pvp' && (
            <PvPLobby
              walletAddr={walletAddr}
              processing={processing}
              gameMode={gameMode}
              pvpOpponent={pvpOpponent}
              pvpOutboundChallenge={pvpOutboundChallenge}
              connectWallet={connectWallet}
              createPvPChallenge={createPvPChallenge}
              acceptPvPChallenge={acceptPvPChallenge}
              declinePvPChallenge={declinePvPChallenge}
              cancelPvPChallenge={cancelPvPChallenge}
              navigate={setActivePage}
              addLog={log}
            />
          )}

          {activePage === 'gallery' && (
            <NFTGallery
              walletAddr={walletAddr}
              navigate={setActivePage}
            />
          )}

          {activePage === 'spectate' && (
            <SpectatorLobby navigate={setActivePage} />
          )}
        </>
      )}

      {tutorialActive && (
        <Tutorial
          step={tutorialStep}
          currentStep={tutorialCurrentStep}
          totalSteps={tutorialTotalSteps}
          onNext={tutorialNext}
          onPrev={tutorialPrev}
          onSkip={tutorialSkip}
        />
      )}
    </>
  );
}
