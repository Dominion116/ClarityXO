import { EMPTY, PLAYER_X, PLAYER_O } from './constants';

export function boardFromIndices(xIndices, oIndices) {
  const board = Array(9).fill(EMPTY);
  for (const i of xIndices) board[i] = PLAYER_X;
  for (const i of oIndices) board[i] = PLAYER_O;
  return board;
}

export function countEmpty(board) {
  return board.filter(c => c === EMPTY).length;
}

export function countPlayer(board, player) {
  return board.filter(c => c === player).length;
}

export function emptyIndices(board) {
  return board.reduce((acc, c, i) => { if (c === EMPTY) acc.push(i); return acc; }, []);
}

export function boardToString(board) {
  const sym = { [EMPTY]: '.', [PLAYER_X]: 'X', [PLAYER_O]: 'O' };
  return board.map(c => sym[c] || '?').join('');
}

export function isBoardFull(board) {
  return board.every(c => c !== EMPTY);
}

export function cellIndex(row, col) {
  return row * 3 + col;
}

export function cellCoords(idx) {
  return { row: Math.floor(idx / 3), col: idx % 3 };
}
