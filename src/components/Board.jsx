import React, { useState, useCallback } from 'react';
import { Cell } from './Cell';

const COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export function Board({ grid, attacks, ships, mode, onAttack, onPlaceShip, label }) {
  const [dragState, setDragState] = useState(null);
  const [orientation, setOrientation] = useState('horizontal');
  const [preview, setPreview] = useState([]);

  const computePreview = useCallback(
    (row, col, ship, orient) => {
      if (!ship) return [];
      const length = ship.getLength();
      const cells = [];
      let valid = true;

      for (let i = 0; i < length; i++) {
        const r = orient === 'horizontal' ? row : row + i;
        const c = orient === 'horizontal' ? col + i : col;
        if (r < 0 || r >= 10 || c < 0 || c >= 10 || grid[r][c] !== 0) {
          valid = false;
        }
        cells.push({ row: r, col: c, valid });
      }
      return cells.map((cell) => ({ ...cell, valid }));
    },
    [grid],
  );
  function handleMouseDown(e, row, col) {
    if (mode !== 'placement') return;
    if (grid[row][col] === 0) return;

    const shipData = grid[row][col];
    const ship = shipData[0];
    const orient = shipData[3];

    if (orient === 'horizontal') {
      for (let k = shipData[1]; k <= shipData[2]; k++) grid[row][k] = 0;
    } else {
      for (let k = shipData[1]; k <= shipData[2]; k++) grid[k][col] = 0;
    }

    setOrientation(orient);
    setDragState({
      ship,
      orientation: orient,
      originalPosition: {
        ship,
        row,
        col,
        start: shipData[1],
        end: shipData[2],
        orientation: orient,
      },
    });
  }
  function handleMouseEnter(e, row, col) {
    if (!dragState) return;
    setPreview(computePreview(row, col, dragState.ship, orientation));
  }

  function handleMouseUp(e) {
    if (!dragState) return;
    const target = e.target.closest('[data-row]');
    if (!target) {
      restoreOriginal();
      return;
    }

    const row = Number(target.dataset.row);
    const col = Number(target.dataset.col);
    const length = dragState.ship.getLength();

    const endRow = orientation === 'horizontal' ? row : row + length - 1;
    const endCol = orientation === 'horizontal' ? col + length - 1 : col;

    const success = onPlaceShip(dragState.ship, row, col, endRow, endCol);

    if (!success) restoreOriginal();

    setDragState(null);
    setPreview([]);
  }

  function restoreOriginal() {
    if (!dragState) return;
    const op = dragState.originalPosition;
    if (op.orientation === 'horizontal') {
      onPlaceShip(op.ship, op.row, op.start, op.row, op.end);
    } else {
      onPlaceShip(op.ship, op.start, op.col, op.end, op.col);
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    if (!dragState) return;
    const newOrient = orientation === 'horizontal' ? 'vertical' : 'horizontal';
    setOrientation(newOrient);
    if (preview.length > 0) {
      const anchor = preview[0];
      setPreview(computePreview(anchor.row, anchor.col, dragState.ship, newOrient));
    }
  }

  const previewMap = {};
  preview.forEach(({ row, col, valid }) => {
    previewMap[`${row}-${col}`] = valid ? 'preview' : 'invalid';
  });

  return (
    <div
      className="board"
      onMouseUp={dragState ? handleMouseUp : undefined}
      onMouseLeave={dragState ? () => { restoreOriginal(); setDragState(null); setPreview([]); } : undefined}
      onContextMenu={handleContextMenu}
    >
      <div className="board-row">
        <div className="board-label" />
        {COLS.map((c) => (
          <div key={c} className="board-label">{c}</div>
        ))}
      </div>

      {grid.map((rowData, r) => (
        <div key={r} className="board-row">
          <div className="board-label">{r}</div>
          {rowData.map((cell, c) => {
            const previewType = previewMap[`${r}-${c}`];
            const attackState = attacks[r][c];
            
            const showOccupied = mode !== 'attack' && cell !== 0;

            return (
              <Cell
                key={c}
                row={r}
                col={c}
                attackState={attackState}
                isOccupied={showOccupied}
                isPreview={previewType === 'preview'}
                isInvalid={previewType === 'invalid'}
                onClick={mode === 'attack' ? onAttack : undefined}
                onMouseDown={mode === 'placement' ? handleMouseDown : undefined}
                onMouseEnter={dragState ? handleMouseEnter : undefined}
              />
            );
          })}
        </div>
      ))}

      {label && <p className="board-label-text">{label}</p>}
    </div>
  );
}
