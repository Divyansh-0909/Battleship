function Ship(shipLength) {
  let numberOfHits = 0;
  function hit() {
    numberOfHits++;
  }

  function isSunk() {
    if (shipLength === numberOfHits) return true;
    return false;
  }

  function getHits() {
    return numberOfHits;
  }
  return { hit, isSunk, shipLength, getHits };
}

export { Ship };
