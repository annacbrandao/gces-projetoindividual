const { GameCollection } = require('../games');

const fuzzInputs = [
  null,
  undefined,
  '',
  ' ',
  0,
  -1,
  Infinity,
  NaN,
  true,
  false,
  [],
  {},
  '<script>alert(1)</script>',
  'a'.repeat(10000),
  '../../etc/passwd',
  '\x00\x01\x02',
  'SELECT * FROM games',
  '{"name": "game"}',
];

describe('Fuzzing - GameCollection.createGame', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); });

  fuzzInputs.forEach((input) => {
    const label = JSON.stringify(input) ?? String(input);
    test('nao deve lancar excecao com entrada: ' + label, () => {
      expect(() => { games.createGame(input); }).not.toThrow();
    });
  });
});

describe('Fuzzing - GameCollection.getGame', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); games.createGame('valid-game'); });

  fuzzInputs.forEach((input) => {
    const label = JSON.stringify(input) ?? String(input);
    test('nao deve lancar excecao com entrada: ' + label, () => {
      expect(() => { games.getGame(input); }).not.toThrow();
    });
  });
});

describe('Fuzzing - GameCollection.removeGame', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); });

  fuzzInputs.forEach((input) => {
    const label = JSON.stringify(input) ?? String(input);
    test('nao deve lancar excecao com entrada: ' + label, () => {
      expect(() => { games.removeGame(input); }).not.toThrow();
    });
  });
});
