import React, { useState, useEffect, useCallback, useRef } from "react";
import { CONTRACT_ADDRESS, CONTRACT_NAME, NETWORK } from "./config";
import { EMPTY, PLAYER_X, PLAYER_O, STATUS_ACTIVE, STATUS_X_WON, STATUS_O_WON, STATUS_DRAW } from "./utils/constants";
import { checkWinner, chooseAiMove, getWinningLine } from "./utils/gameLogic";
import { callReadOnly, parseBoardFromClarityValue, parseUintResult } from "./utils/stacks";
import { KEYFRAMES, styles } from "./styles/styles";
import { XMark, OMark } from "./components/Icons";

export default function ClarityXO() {
  const [board,       setBoard]       = useState(Array(9).fill(EMPTY));
  const [status,      setStatus]      = useState(STATUS_ACTIVE);
  const [moveCount,   setMoveCount]   = useState(0);
  const [processing,  setProcessing]  = useState(false);
  const [walletAddr,  setWalletAddr]  = useState(null);
  const [logs,        setLogs]        = useState([]);
  const [newCells,    setNewCells]    = useState(new Set());
  const [winLine,     setWinLine]     = useState(null);
  const logRef = useRef(null);

  // ── Logging ─────────────────────────────────────────────────────────────
  const log = useCallback((msg, type = "info") => {
    setLogs(prev => [...prev.slice(-50), { msg, type, ts: Date.now() }]);
    setTimeout(() => {
      if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
    }, 50);
  }, []);

  // ── Inject CSS ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!document.getElementById("clarity-xo-styles")) {
      const el = document.createElement("style");
      el.id = "clarity-xo-styles";
      el.textContent = KEYFRAMES;
      document.head.appendChild(el);
    }
  }, []);

  // ── Fetch on-chain state ─────────────────────────────────────────────────
  const syncChainState = useCallback(async () => {
    try {
      const [boardRes, statusRes, movesRes] = await Promise.all([
        callReadOnly("get-board-state"),
        callReadOnly("get-game-status"),
        callReadOnly("get-moves-count"),
      ]);
      const chainBoard  = parseBoardFromClarityValue(boardRes);
      const chainStatus = parseUintResult(statusRes);
      const chainMoves  = parseUintResult(movesRes);
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

  // ── Connect Hiro / Leather Wallet ───────────────────────────────────────
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
          const addr = data?.userSession?.loadUserData()?.profile?.stxAddress?.[NETWORK];
          setWalletAddr(addr || "connected");
          log(`Wallet connected: ${addr?.slice(0,12)}…`, "success");
        },
        onCancel: () => log("Wallet connection cancelled.", "error"),
      });
    } catch (e) {
      log(`Wallet error: ${e.message}`, "error");
    }
  }, [log]);

  // ── Make a move ──────────────────────────────────────────────────────────
  const makeMove = useCallback(async (idx) => {
    if (processing || status !== STATUS_ACTIVE) return;
    if (board[idx] !== EMPTY) return;

    const row = Math.floor(idx / 3);
    const col = idx % 3;

    // ── Optimistic update ──────────────────────────────────────────────
    const nextBoard = [...board];
    nextBoard[idx] = PLAYER_X;

    let aiIdx = -1;
    let statusAfterX = STATUS_ACTIVE;
    const winnerAfterX = checkWinner(nextBoard);
    if (winnerAfterX === PLAYER_X) {
      statusAfterX = STATUS_X_WON;
    } else if (nextBoard.filter(c => c === EMPTY).length === 0) {
      statusAfterX = STATUS_DRAW;
    }

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
    if (statusAfterX !== STATUS_ACTIVE) {
      setStatus(statusAfterX);
      setWinLine(getWinningLine(nextBoard));
    }

    setTimeout(() => setNewCells(new Set()), 400);

    // ── Submit to chain ────────────────────────────────────────────────
    if (!walletAddr) {
      log("Move simulated locally. Connect wallet to play on-chain.", "info");
      return;
    }

    try {
      setProcessing(true);
      const { openContractCall } = await import("@stacks/connect");
      const { uintCV }           = await import("@stacks/transactions");
      const { StacksTestnet, StacksMainnet } = await import("@stacks/network");
      const network = NETWORK === "mainnet" ? new StacksMainnet() : new StacksTestnet();

      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName:    CONTRACT_NAME,
        functionName:    "make-move",
        functionArgs:    [uintCV(row), uintCV(col)],
        appDetails:      { name: "ClarityXO", icon: "" },
        onFinish: (data) => {
          log(`TX broadcast: ${data.txId?.slice(0, 16)}…`, "success");
          setTimeout(syncChainState, 6000); // wait a block
        },
        onCancel: () => log("Transaction cancelled.", "error"),
      });
    } catch (e) {
      log(`TX error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [board, processing, status, walletAddr, log, syncChainState]);

  // ── Reset (local only – contract is single-game per deploy) ─────────────
  const resetLocal = useCallback(() => {
    setBoard(Array(9).fill(EMPTY));
    setStatus(STATUS_ACTIVE);
    setMoveCount(0);
    setWinLine(null);
    setNewCells(new Set());
    log("Board reset locally. Note: on-chain state is unchanged.", "info");
  }, [log]);

  // ── Resign ───────────────────────────────────────────────────────────────
  const resign = useCallback(async () => {
    if (!walletAddr) { log("Connect wallet to resign.", "error"); return; }
    try {
      setProcessing(true);
      const { openContractCall } = await import("@stacks/connect");
      const { StacksTestnet, StacksMainnet } = await import("@stacks/network");
      const network = NETWORK === "mainnet" ? new StacksMainnet() : new StacksTestnet();
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName:    CONTRACT_NAME,
        functionName:    "resign-game",
        functionArgs:    [],
        appDetails:      { name: "ClarityXO", icon: "" },
        onFinish: (data) => {
          log(`Resigned. TX: ${data.txId?.slice(0, 16)}…`, "success");
          setStatus(STATUS_O_WON);
        },
        onCancel: () => log("Resign cancelled.", "error"),
      });
    } catch(e) {
      log(`Resign error: ${e.message}`, "error");
    } finally {
      setProcessing(false);
    }
  }, [walletAddr, log]);

  // ── Status text ──────────────────────────────────────────────────────────
  const statusLabel = () => {
    if (processing)          return "broadcasting…";
    if (status === STATUS_X_WON) return "you win";
    if (status === STATUS_O_WON) return "computer wins";
    if (status === STATUS_DRAW)  return "draw";
    return "your move";
  };

  const statusColor = () => {
    if (status === STATUS_X_WON) return "#44bb88";
    if (status === STATUS_O_WON) return "#ff4444";
    if (status === STATUS_DRAW)  return "#888";
    return "#e8e0d0";
  };

  const gameOver = status !== STATUS_ACTIVE;

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo}>
          Clarity<span style={styles.logoAccent}>XO</span>
        </div>
        <div style={styles.networkBadge}>{NETWORK}</div>
      </div>

      <div style={styles.main}>
        <div style={styles.title}>Stacks Blockchain · Tic-Tac-Toe</div>

        {/* Wallet bar */}
        <div style={styles.walletBar}>
          <span>{walletAddr ? `${walletAddr.slice(0, 16)}…` : "no wallet connected"}</span>
          <div style={{ display: "flex", gap: "8px" }}>
            {!walletAddr && (
              <button style={styles.connectBtn} onClick={connectWallet}>
                Connect
              </button>
            )}
            <button style={styles.connectBtn} onClick={syncChainState}>
              Sync Chain
            </button>
          </div>
        </div>

        {/* Status bar */}
        <div style={styles.statusBar}>
          <span style={{ display: "flex", alignItems: "center" }}>
            <span style={{
              ...styles.statusDot(!gameOver && !processing, "#44bb88"),
              ...((!gameOver && !processing) ? { animation: "pulse 1.8s ease-in-out infinite" } : {}),
            }} />
            <span style={{ color: statusColor(), letterSpacing: "0.3em" }}>
              {statusLabel()}
            </span>
          </span>
          <span style={{ color: "#333", fontSize: "10px" }}>
            move {moveCount}
          </span>
        </div>

        {/* Board */}
        <div style={styles.boardWrap}>
          {board.map((cell, idx) => {
            const isWin = winLine?.includes(idx);
            const isNew = newCells.has(idx);
            const canClick = cell === EMPTY && !processing && !gameOver;
            return (
              <div
                key={idx}
                style={{
                  ...styles.cell(cell, isWin, processing || gameOver),
                  // Remove right border on last col, bottom on last row
                  borderRight: [2,5,8].includes(idx) ? "none" : "1px solid #1e1e1e",
                  borderBottom: [6,7,8].includes(idx) ? "none" : "1px solid #1e1e1e",
                }}
                onClick={() => canClick && makeMove(idx)}
                onMouseEnter={e => {
                  if (canClick) e.currentTarget.style.background = "#111";
                }}
                onMouseLeave={e => {
                  if (!isWin) e.currentTarget.style.background = "transparent";
                }}
              >
                {cell === PLAYER_X && <XMark size={40} animated={isNew} />}
                {cell === PLAYER_O && <OMark size={40} animated={isNew} />}
              </div>
            );
          })}

          {/* Processing overlay */}
          {processing && (
            <div style={styles.overlay}>
              <span style={styles.overlayText}>waiting…</span>
            </div>
          )}
        </div>

        {/* Info row */}
        <div style={styles.infoRow}>
          <div style={{ ...styles.infoCell(true), minWidth: 0 }}>
            <span style={{ color: "#ff4444" }}>X</span> · You
          </div>
          <div style={{ ...styles.infoCell(false), minWidth: 0 }}>
            <span style={{ color: "#e8e0d0" }}>O</span> · Computer
          </div>
          <div style={{ ...styles.infoCell(false), borderRight: "none", minWidth: 0 }}>
            Cells left: {board.filter(c => c === EMPTY).length}
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.btnRow}>
          <button
            style={styles.btn("primary")}
            onClick={resetLocal}
            onMouseEnter={e => e.currentTarget.style.background = "#cc3333"}
            onMouseLeave={e => e.currentTarget.style.background = "#ff4444"}
          >
            New Game
          </button>
          <button
            style={{ ...styles.btn("secondary"), borderRight: "none" }}
            onClick={resign}
            onMouseEnter={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#aaa"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#666"; }}
          >
            Resign
          </button>
        </div>

        {/* Contract info */}
        <div style={{
          width: "100%",
          padding: "10px 16px",
          fontSize: "9px",
          letterSpacing: "0.15em",
          color: "#2a2a2a",
          border: "1px solid #1a1a1a",
          borderTop: "none",
          boxSizing: "border-box",
          fontFamily: "inherit",
          wordBreak: "break-all",
        }}>
          {CONTRACT_ADDRESS}.{CONTRACT_NAME}
        </div>

        {/* Log */}
        <div style={{ width: "100%", marginTop: "16px" }}>
          <div style={{
            fontSize: "9px",
            letterSpacing: "0.25em",
            color: "#2a2a2a",
            textTransform: "uppercase",
            paddingBottom: "6px",
          }}>
            Event Log
          </div>
          <div style={styles.log} ref={logRef}>
            {logs.length === 0 && (
              <div style={styles.logLine("info")}>Ready. Click a cell to play.</div>
            )}
            {logs.map((l, i) => (
              <div key={i} style={styles.logLine(l.type)}>{l.msg}</div>
            ))}
          </div>
        </div>

        {/* Contract reference */}
        <div style={{
          marginTop: "24px",
          fontSize: "9px",
          letterSpacing: "0.2em",
          color: "#222",
          textTransform: "uppercase",
          textAlign: "center",
        }}>
          ClarityXO · Stacks · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}