/*
  File: Lobby class

  - Instantiated by the server
  - Instantiates a world
  - Manages all socket I/O with clients in the lobby
  - Handles pre-game logic (e.g. countdown timer)
  - Handles end-game logic (TBD)

  Author(s): Kyle, Tom
*/

const World = require('./world');

class Lobby {
  constructor(io) {
    this.io = io;

    // ID will be used as room for sockets
    this.id = `${Lobby.lobbyID++}`;

    this.world = new World();
    this.inProgress = false;
    this.players = [];

    // FPS determines time between frames
    // World always simulates so clients can see their ships rotating before the game starts
    this.loop = setInterval(this.snapshot.bind(this), 1000 / World.fps);
  }

  join(socket) {
    this.players.push(socket);

    // Give the player a ship in the world
    this.world.addPlayer(socket.id);
    socket.emit('player setup', {
      id: socket.id,
      world: [this.world.width, this.world.height],
    });

    // Tell everyone in the room this player has joined
    this.io.to(this.id).emit('joined lobby', socket.id);
    socket.join(this.id); // join the room

    // Cleanup properly if they leave
    socket.on('disconnecting', () => this.leave(socket));

    // Send inputs recieved from player to simulation
    socket.on('keydown', (input) => {
      this.world.playerInput(socket.id, input);
    });
    socket.on('keyup', (input) => {
      this.world.playerInput(socket.id, input, true);
    });

    // Game start countdown begins when anyone is in the lobby
    if (this.players.length === 1) {
      this.startCountdown();
    }
  }

  leave(socket) {
    socket.removeAllListeners('keydown');
    socket.removeAllListeners('keyup');
    socket.leave(this.id);

    const i = this.players.find((p) => socket.id === p.id);
    this.players.splice(i, 1);

    // World exists until game reaches end condition
    if (this.world) {
      this.world.removePlayer(socket.id, this.inProgress);

      // Server needs to clean up if all players leave
      if (this.players.length === 0) {
        if (this.inProgress) {
          this.endGame();
        } else {
          // Don't start a game without players
          this.stopCountdown();
        }
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
      } else {
        this.io.to(this.id).emit('prestart count', this.countdown);
      }
    }, 1000);
  }

  // Countdown stops if everyone leaves or game starts
  stopCountdown() {
    clearInterval(this.countdownLoop);
  }

  startGame() {
    this.inProgress = true;

    // Start the game and tell clients
    this.world.start();
    this.io.to(this.id).emit('game start');

    // Set end game condition now (2 minute timer)
    this.timer = setTimeout(this.endGame.bind(this), 1000 * 60 * 2);
  }

  snapshot() {
    this.world.simulate();
    this.io.to(this.id).emit('snapshot', this.world.serialize());
  }

  endGame() {
    // Stop sending out simulation frames
    clearInterval(this.loop);

    // Game may end prematurely (if everyone leaves)
    clearTimeout(this.timer);

    // Tell clients the game has ended
    // Pass out score stats for client-side leaderboard
    this.io.to(this.id).emit(
      'game over',
      // TODO send final stats here, sort by score beforehand
      // TODO generate guest usernames for use here
      { // sending some dummy data until scoring implemented
        someuser: { kills: 2, deaths: 1, score: 3245 },
        otheruser: { kills: 1, deaths: 0, score: 53 },
      }
    );

    delete this.world;

    // Remove all players from the lobby
    this.players.forEach((p) => this.leave(p));
  }
}
Lobby.lobbyID = 0;

// Time from first player joining to game starting
Lobby.startTime = 10; // seconds

module.exports = Lobby;
