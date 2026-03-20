import { EMPTY, PLAYER_X, PLAYER_O } from "./constants";

// ── Optimistic AI logic (mirrors the Clarity contract) ────────────────────
export function checkLine(a, b, c) { 
  return a !== EMPTY && a === b && b === c; 
}

export function checkWinner(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6],         // diagonals
  ];
  for (const [a,b,c] of wins) {
    if (checkLine(board[a], board[b], board[c])) return board[a];
  }
  return EMPTY;
}

export function wouldWin(board, index, player) {
  const copy = [...board];
  copy[index] = player;
  return checkWinner(copy) === player;
}

export function findWinningMove(board, player) {
  for (let i = 0; i < 9; i++) {
    if (board[i] === EMPTY && wouldWin(board, i, player)) return i;
  }
  return -1;
}

export function chooseAiMove(board) {
  const win = findWinningMove(board, PLAYER_O);
  if (win !== -1) return win;
  
  const block = findWinningMove(board, PLAYER_X);
  if (block !== -1) return block;
  
  if (board[4] === EMPTY) return 4;
  
  for (const c of [0,2,6,8]) if (board[c] === EMPTY) return c;
  for (const e of [1,3,5,7]) if (board[e] === EMPTY) return e;
  
  return -1;
}

export function getWinningLine(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6],
  ];
  for (const line of wins) {
    const [a,b,c] = line;
    if (checkLine(board[a], board[b], board[c])) return line;
  }
  return null;
}
