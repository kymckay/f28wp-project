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
    this.players = {};

    // FPS determines time between frames
    // World always simulates so clients can see their ships rotating before the game starts
    this.loop = setInterval(this.snapshot.bind(this), 1000 / World.fps);
    console.log(`Lobby[${this.id}] created`);
  }

  join(socket) {
    console.log(`${socket.id} -> added to players`);
    this.players[socket.id] = socket;
    const player = this.players[socket.id];

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
    socket.on('disconnecting', () => {
      this.world.removePlayer(socket.id);
      this.leave(socket);
    });

    // Send inputs recieved from player to simulation
    player.keyDown = socket.on('keydown', (input) => {
      this.world.playerInput(socket.id, input);
    });
    player.keyUp = socket.on('keyup', (input) => {
      this.world.playerInput(socket.id, input, true);
    });

    // Game start countdown begins when anyone is in the lobby
    if (Object.keys(this.players).length === 1) {
      this.startCountdown();
    }
    console.log(`Lobby[${this.id}] ${socket.id} connected`);
  }

  leave(socket) {
    const player = this.players[socket.id];
    console.log(`${socket.id} -> leave`);
    if (this.world) {
      this.world.removePlayer(socket.id);
    }
    console.log(`${socket.id} -> remove keydown`);
    // socket.removeListener(player.KeyDown);
    socket.removeListener();
    console.log(`${socket.id} -> remove keyup`);
    socket.removeListener(player.KeyUp);
    socket.leave(this.id);
    delete this.players[socket.id];

    // TODO handle this client-side
    this.io.to(this.id).emit('left lobby', socket.id);

    // Server needs to clean up if all players leave
    if (Object.keys(this.players).length === 0) {
      if (this.inProgress) {
        this.endGame();
      } else {
        // Don't start a game without players
        this.stopCountdown();
      }
    }
    console.log(`Lobby[${this.id}] ${socket.id} disconnected`);
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

    console.log(`Lobby[${this.id}] starting in ${Lobby.startTime}`);
  }

  // Countdown stops if everyone leaves or game starts
  stopCountdown() {
    clearInterval(this.countdownLoop);
  }

  startGame() {
    this.inProgress = true;

    this.world.start();

    this.io.to(this.id).emit('game start');

    console.log(`Lobby[${this.id}] has started`);

    setTimeout(this.endGame.bind(this), 3000);
  }

  snapshot() {
    this.world.simulate();
    this.io.to(this.id).emit('snapshot', this.world.serialize());
  }

  endGame() {
    console.log('Clearing Interval');
    clearInterval(this.loop);
    console.log('Emitting `game over`');
    this.io.to(this.id).emit('game over', {});
    console.log(`Iterating through ${this.players.length} connections`);
    Object.values(this.players).forEach((p) => {
      console.log(`${p} -> leave`);
      this.leave(p);
    });
    delete this.world;
  }
}
Lobby.lobbyID = 0;

// Time from first player joining to game starting
Lobby.startTime = 10; // seconds

module.exports = Lobby;
