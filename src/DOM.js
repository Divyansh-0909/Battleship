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

function createDisplay(player) {
  const main = document.querySelector('.main');
  const display = document.createElement('div');
  display.className = 'display';

  for (let i = 0; i < player.grid.length; i++) {
    const row = document.createElement('div');
    row.className = 'row';

    for (let j = 0; j < player.grid[i].length; j++) {
      const element = document.createElement('div');
      if (player.grid[i][j] === 0) element.className = 'empty';
      else element.className = 'occupied';
      row.append(element);
    }
    display.append(row);
  }
  console.log(player.grid);
  main.append(display);
}

export { createDropDown, createDisplay };
