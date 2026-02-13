import { Ship } from './ship_module.js';

test('Ship initializes with correct length', () => {
  expect(Ship(3).shipLength).toBe(3);
});

test('Hit function increases numberOfHits', () => {
  const ship = Ship(3);
  ship.hit();
  expect(ship.getHits()).toBe(1);
});

test('isSunk return false initially', () => {
  const ship = Ship(3);
  expect(ship.isSunk()).toBe(false);
});

test('isSunk return true after all length is hit', () => {
  const ship = Ship(3);
  ship.hit();
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});
