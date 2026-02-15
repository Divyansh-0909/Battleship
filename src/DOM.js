function createDropDown() {
  const dropdown = document.querySelector('.dropDown');

  const skins = ['Light', 'Dark', 'Transparent'];

  let options;

  dropdown.addEventListener('mouseenter', () => {
    if (!options) {
      options = document.createElement('div');
      options.className = 'options';
      const ul = document.createElement('ul');

      for (let i = 0; i < skins.length; i++) {
        const li = document.createElement('li');
        if (skins[i] === 'Light') {
          li.className = 'selected';
          li.textContent = 'Light';
        } else li.textContent = `${skins[i]}`;
        ul.append(li);

        li.addEventListener('mouseenter', () => {
          li.classList.add('selected');
        });

        li.addEventListener('mouseleave', () => {
          li.classList.remove('selected');
        });
      }
      options.append(ul);
      dropdown.append(options);
    }
  });

  dropdown.addEventListener('mouseleave', () => {
    options.remove();
    options = null;
  });
}

function createDisplay(player, state, type, onAttack) {
  const display = document.createElement('div');
  display.className = 'display';

  let draggedShip = null;
  let originalPosition = null;
  let orientation = 'horizontal';
  let lastHoveredCell = null;

  let hasAttacked = false;

  function clearPreview() {
    display.querySelectorAll('.preview, .invalid').forEach((el) => {
      el.classList.remove('preview', 'invalid');
    });
  }

  function updatePreview(cell) {
    if (!draggedShip || !cell || !cell.dataset.row) return;

    lastHoveredCell = cell;
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const length = draggedShip.shipLength;

    clearPreview();

    let valid = true;

    for (let i = 0; i < length; i++) {
      let r = orientation === 'horizontal' ? row : row + i;
      let c = orientation === 'horizontal' ? col + i : col;

      if (r < 0 || r >= 10 || c < 0 || c >= 10 || player.grid[r][c] !== 0) {
        valid = false;
      }
    }

    for (let i = 0; i < length; i++) {
      let r = orientation === 'horizontal' ? row : row + i;
      let c = orientation === 'horizontal' ? col + i : col;

      const previewCell = display.querySelector(
        `[data-row="${r}"][data-col="${c}"]`,
      );

      if (previewCell) {
        previewCell.classList.add(valid ? 'preview' : 'invalid');
      }
    }
  }

  function render() {
    display.innerHTML = '';

    const labelsX = [' ', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

    // Create Header Row (A-J)
    const headerRow = document.createElement('div');
    headerRow.className = 'row';
    labelsX.forEach((label) => {
      const labelCell = document.createElement('div');
      labelCell.className = 'label';
      labelCell.textContent = label;
      headerRow.append(labelCell);
    });
    display.append(headerRow);

    // Create Grid Rows (1-10 + Data)
    for (let i = 0; i < player.grid.length; i++) {
      const row = document.createElement('div');
      row.className = 'row';

      // Add Row Label (1-10)
      const rowLabel = document.createElement('div');
      rowLabel.className = 'label';
      rowLabel.textContent = i;
      row.append(rowLabel);

      for (let j = 0; j < player.grid[i].length; j++) {
        const cell = document.createElement('div');

        if (player.grid[i][j] === 0) {
          cell.className = 'empty';
        } else {
          if (state === 'initial') cell.className = 'occupied';
          else cell.className = 'empty';
        }

        cell.dataset.row = i;
        cell.dataset.col = j;

        if (state === 'initial') {
          cell.addEventListener('mousedown', () => {
            if (player.grid[i][j] === 0) return;

            const shipData = player.grid[i][j];
            draggedShip = shipData[0];
            orientation = shipData[3];

            originalPosition = {
              ship: shipData[0],
              start: shipData[1],
              end: shipData[2],
              row: i,
              col: j,
              orientation: shipData[3],
            };

            if (orientation === 'horizontal') {
              for (let k = shipData[1]; k <= shipData[2]; k++) {
                player.grid[i][k] = 0;
              }
            } else {
              for (let k = shipData[1]; k <= shipData[2]; k++) {
                player.grid[k][j] = 0;
              }
            }
            render();
          });
        } else {
          cell.addEventListener('click', () => {
            if (!hasAttacked && player.attacks[i][j] === null) {
              hasAttacked = true;

              player.receiveAttack(i, j);

              if (player.attacks[i][j] === 1) {
                cell.textContent = 'X';
              } else if (player.attacks[i][j] === 0) {
                cell.textContent = '•';
              }

              setTimeout(() => {
                onAttack();
              }, 700);
            }
          });

          if (player.attacks[i][j] === 1) {
            cell.textContent = 'X';
          } else if (player.attacks[i][j] === 0) {
            cell.textContent = '•';
          }
        }

        row.append(cell);
      }

      display.append(row);
    }
    const h1 = document.createElement('h1');
    if (state === 'initial') h1.textContent = 'Place your Ships!';
    else {
      if (type === 'computer') h1.textContent = "Computer's turn";
      else h1.textContent = 'Your turn';
    }
    display.append(h1);
  }

  if (state === 'initial') {
    display.addEventListener('mousemove', (e) => {
      const cell = e.target.closest('div');
      updatePreview(cell);
    });

    display.addEventListener('mouseup', (e) => {
      if (!draggedShip) return;
      const cell = e.target.closest('div');
      if (!cell || !cell.dataset.row) return;

      const row = Number(cell.dataset.row);
      const col = Number(cell.dataset.col);
      const length = draggedShip.shipLength;

      let startX = row;
      let startY = col;
      let endX, endY;

      if (orientation === 'horizontal') {
        endX = row;
        endY = col + length - 1;
      } else {
        endX = row + length - 1;
        endY = col;
      }

      const success = player.placeShip(draggedShip, startX, startY, endX, endY);

      if (!success) {
        if (originalPosition.orientation === 'horizontal') {
          player.placeShip(
            originalPosition.ship,
            originalPosition.row,
            originalPosition.start,
            originalPosition.row,
            originalPosition.end,
          );
        } else {
          player.placeShip(
            originalPosition.ship,
            originalPosition.start,
            originalPosition.col,
            originalPosition.end,
            originalPosition.col,
          );
        }
      }

      draggedShip = null;
      originalPosition = null;
      lastHoveredCell = null;
      clearPreview();
      render();
    });

    display.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      if (!draggedShip) return;
      orientation = orientation === 'horizontal' ? 'vertical' : 'horizontal';
      updatePreview(lastHoveredCell);
    });
  }

  render();
  return display;
}

function createButtons(state) {
  const main = document.querySelector('.main');

  const gameActionButtons = document.createElement('div');
  gameActionButtons.className = 'gameActionButtons';

  const gridActionButtons = document.createElement('div');
  gridActionButtons.className = 'gridActionButtons';

  function start() {
    const fieldset = document.createElement('fieldset');
    const button = document.createElement('button');
    button.id = 'start';
    button.name = 'start';

    const label = document.createElement('label');
    label.htmlFor = 'start';
    label.textContent = 'Start';

    if (state === 'running') {
      fieldset.className = 'inActive';
    } else {
      fieldset.className = 'Active';
    }

    fieldset.append(button, label);
    gameActionButtons.append(fieldset);
  }

  function leave() {
    const fieldset = document.createElement('fieldset');
    const button = document.createElement('button');
    button.id = 'leave';
    button.name = 'leave';

    const label = document.createElement('label');
    label.htmlFor = 'leave';
    label.textContent = 'Leave';

    if (state === 'initial') {
      fieldset.className = 'inActive';
    } else {
      fieldset.className = 'Active';
    }

    fieldset.append(button, label);
    gameActionButtons.append(fieldset);
  }

  function random() {
    const fieldset = document.createElement('fieldset');
    const button = document.createElement('button');
    button.id = 'random';
    button.name = 'random';

    const label = document.createElement('label');
    label.htmlFor = 'random';
    label.textContent = 'Random';

    if (state === 'initial') {
      fieldset.className = 'Active';
    } else {
      fieldset.className = 'inActive';
    }

    fieldset.append(button, label);
    gridActionButtons.append(fieldset);
  }

  function reset() {
    const fieldset = document.createElement('fieldset');
    const button = document.createElement('button');
    button.id = 'reset';
    button.name = 'reset';

    const label = document.createElement('label');
    label.htmlFor = 'reset';
    label.textContent = 'Reset';

    if (state === 'initial') {
      fieldset.className = 'Active';
    } else {
      fieldset.className = 'inActive';
    }

    fieldset.append(button, label);
    gridActionButtons.append(fieldset);
  }

  random();
  reset();

  start();
  leave();
  main.prepend(gameActionButtons);
  main.append(gridActionButtons);
}

export { createDisplay, createDropDown, createButtons };
