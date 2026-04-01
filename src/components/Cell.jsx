import React from 'react';

export function Cell({
  row,
  col,
  attackState,
  isOccupied,
  isPreview,
  isInvalid,
  onClick,
  onMouseDown,
  onMouseEnter,
}) {
  function getClassName() {
    if (attackState === 1) return 'cell hit';
    if (attackState === 0) return 'cell miss';
    if (isInvalid) return 'cell invalid';
    if (isPreview) return 'cell preview';
    if (isOccupied) return 'cell occupied';
    return 'cell empty';
  }

  function getLabel() {
    if (attackState === 1) return 'X';
    if (attackState === 0) return '•';
    return '';
  }

  return (
    <div
      className={getClassName()}
      data-row={row}
      data-col={col}
      onClick={onClick ? () => onClick(row, col) : undefined}
      onMouseDown={onMouseDown ? (e) => onMouseDown(e, row, col) : undefined}
      onMouseEnter={onMouseEnter ? (e) => onMouseEnter(e, row, col) : undefined}
    >
      {getLabel()}
    </div>
  );
}
