const { GameCollection } = require('../games');

describe('GameCollection', () => {
  let games;

  beforeEach(() => {
    games = new GameCollection();
  });

  test('deve criar um jogo com sucesso', () => {
    const result = games.createGame('test-game');
    expect(result).toBe(true);
  });

  test('deve retornar false ao criar jogo com nome duplicado', () => {
    games.createGame('test-game');
    const result = games.createGame('test-game');
    expect(result).toBe(false); // falha: bug no games.js retorna true
  });

  test('deve recuperar um jogo criado', () => {
    games.createGame('test-game');
    const game = games.getGame('test-game');
    expect(game).toBeDefined();
  });

  test('deve retornar undefined para jogo inexistente', () => {
    const game = games.getGame('nao-existe');
    expect(game).toBeUndefined();
  });

  test('deve remover um jogo existente', () => {
    games.createGame('test-game');
    const result = games.removeGame('test-game');
    expect(result).toBe(true);
    expect(games.getGame('test-game')).toBeUndefined();
  });
});
