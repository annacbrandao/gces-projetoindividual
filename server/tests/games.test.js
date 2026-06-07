const { GameCollection } = require('../games');

function createMockSocket() {
  const socket = {
    _emitted: {},
    _handlers: {},
    disconnected: false,
    emit: function(event, data) { this._emitted[event] = data; },
    on: function(event, handler) { this._handlers[event] = handler; },
    disconnect: function() { this.disconnected = true; },
    trigger: function(event, data) {
      if (this._handlers[event]) this._handlers[event](data);
    }
  };
  return socket;
}

describe('GameCollection', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); });

  test('deve criar um jogo com sucesso', () => {
    expect(games.createGame('test-game')).toBe(true);
  });

  test('deve retornar false ao criar jogo com nome duplicado', () => {
    games.createGame('test-game');
    expect(games.createGame('test-game')).toBe(false);
  });

  test('deve recuperar um jogo criado', () => {
    games.createGame('test-game');
    expect(games.getGame('test-game')).toBeDefined();
  });

  test('deve retornar undefined para jogo inexistente', () => {
    expect(games.getGame('nao-existe')).toBeUndefined();
  });

  test('deve remover um jogo existente', () => {
    games.createGame('test-game');
    expect(games.removeGame('test-game')).toBe(true);
    expect(games.getGame('test-game')).toBeUndefined();
  });

  test('deve retornar false ao remover jogo inexistente', () => {
    expect(games.removeGame('nao-existe')).toBe(false);
  });
});

describe('Game', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); });

  test('getId deve retornar o id do jogo', () => {
    games.createGame('meu-jogo');
    const game = games.getGame('meu-jogo');
    expect(game.getId()).toBe('meu-jogo');
  });

  test('addPlayer deve aceitar o primeiro jogador', () => {
    games.createGame('jogo1');
    const game = games.getGame('jogo1');
    const socket = createMockSocket();
    expect(game.addPlayer(socket)).toBe(true);
  });

  test('addPlayer deve aceitar o segundo jogador e notificar o primeiro', () => {
    games.createGame('jogo2');
    const game = games.getGame('jogo2');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    expect(game.addPlayer(s2)).toBe(true);
    expect(s1._emitted['player-connected']).toBe(0);
  });

  test('addPlayer deve rejeitar terceiro jogador', () => {
    games.createGame('jogo3');
    const game = games.getGame('jogo3');
    game.addPlayer(createMockSocket());
    game.addPlayer(createMockSocket());
    expect(game.addPlayer(createMockSocket())).toBe(false);
  });

  test('eventos devem ser repassados do jogador 1 para o jogador 2', () => {
    games.createGame('jogo-evt');
    const game = games.getGame('jogo-evt');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('event', { move: 'kick' });
    expect(s2._emitted['event']).toEqual({ move: 'kick' });
  });

  test('eventos devem ser repassados do jogador 2 para o jogador 1', () => {
    games.createGame('jogo-evt2');
    const game = games.getGame('jogo-evt2');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('event', { move: 'punch' });
    expect(s1._emitted['event']).toEqual({ move: 'punch' });
  });

  test('life-update deve ser repassado entre jogadores', () => {
    games.createGame('jogo-life');
    const game = games.getGame('jogo-life');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('life-update', { life: 80 });
    expect(s2._emitted['life-update']).toEqual({ life: 80 });
  });

  test('position-update deve ser repassado entre jogadores', () => {
    games.createGame('jogo-pos');
    const game = games.getGame('jogo-pos');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('position-update', { x: 100 });
    expect(s1._emitted['position-update']).toEqual({ x: 100 });
  });

  test('disconnect do jogador 1 deve encerrar o jogo e desconectar o jogador 2', () => {
    games.createGame('jogo-disc1');
    const game = games.getGame('jogo-disc1');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('disconnect');
    expect(s2.disconnected).toBe(true);
    expect(games.getGame('jogo-disc1')).toBeUndefined();
  });

  test('disconnect do jogador 2 deve encerrar o jogo e desconectar o jogador 1', () => {
    games.createGame('jogo-disc2');
    const game = games.getGame('jogo-disc2');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('disconnect');
    expect(s1.disconnected).toBe(true);
    expect(games.getGame('jogo-disc2')).toBeUndefined();
  });

  test('endGame nao deve lancar excecao se nao houver jogadores', () => {
    games.createGame('jogo-empty');
    const game = games.getGame('jogo-empty');
    expect(() => { game.endGame(0); }).not.toThrow();
  });
});

describe('Game - cobertura adicional', () => {
  let games;
  beforeEach(() => { games = new GameCollection(); });

  test('life-update do jogador 2 deve ser repassado ao jogador 1', () => {
    games.createGame('jogo-life2');
    const game = games.getGame('jogo-life2');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s2.trigger('life-update', { life: 50 });
    expect(s1._emitted['life-update']).toEqual({ life: 50 });
  });

  test('position-update do jogador 1 deve ser repassado ao jogador 2', () => {
    games.createGame('jogo-pos2');
    const game = games.getGame('jogo-pos2');
    const s1 = createMockSocket();
    const s2 = createMockSocket();
    game.addPlayer(s1);
    game.addPlayer(s2);
    s1.trigger('position-update', { x: 200 });
    expect(s2._emitted['position-update']).toEqual({ x: 200 });
  });
});
