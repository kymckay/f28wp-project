const World = require('./world');

class Lobby {
  constructor(io) {
    this.io = io;

    // ID will be used as room for sockets
    this.id = `${Lobby.lobbyID++}`;

    this.world = new World();
    this.inProgress = false;
    this.players = {};
  }

  join(socket) {
    this.players[socket.id] = socket;

    // Give the player a ship in the world
    const ship = this.world.addPlayer(socket.id);
    socket.emit('player setup', ship.serialize());

    // Tell everyone in the room this player has joined
    this.io.to(this.id).emit('joined lobby', socket.id);
    socket.join(this.id); // join the room

    // Game start countdown begins when anyone is in the lobby
    if (Object.keys(this.players).length === 1) {
      this.startCountdown();
    }
  }

  leave(socket) {
    this.world.removePlayer(socket.id);
    delete this.players[socket.id];

    // TODO handle this client-side
    this.io.to(this.id).emit('left lobby', socket.id);

    // Server needs to clean up if all players leave
    if (Object.keys(this.players).length === 0) {
      if (this.inProgress) {
        // TODO stop game running
      } else {
        // Don't start a game without players
        this.stopCountdown();
      }
    }
  }

  startCountdown() {
    this.countdown = Lobby.startTime;

    // Every second tell clients remaining time
    this.countdownLoop = setInterval(() => {
      this.countdown--;

      // Game starts if it hits 0, stop counting
      if (this.countdown === 0) {
        this.stopCountdown();
        this.startGame();
      }

      this.io.to(this.id).emit('prestart count', this.countdown);
    }, 1000);
  }

  // Countdown stops if everyone leaves or game starts
  stopCountdown() {
    clearInterval(this.countdownLoop);
  }

  startGame() {
    this.inProgress = true;

    this.world.start();

    this.io.to(this.id).emit('game start', this.world.serialize());
    setInterval(this.gameTick.bind(this), 100);
  }

  gameTick() {
    this.io.to(this.id).emit('game tick', this.world.serialize());
  }
}
Lobby.lobbyID = 0;

// Time from first player joining to game starting
Lobby.startTime = 10; // seconds

module.exports = Lobby;
