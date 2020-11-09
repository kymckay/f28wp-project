class Lobby {
  constructor(io) {
    this.id = Lobby.lobbyID++;
    this.io = io;
    const size = 4000;
    this.world = new world(size, size);
    this.inProgress = false;
    this.players = [];
  }

  join(playerSocket) {
    this.players.push(playerSocket);
    this.world.addPlayer(playerSocket.id);
    this.io.to(`${this.id}`).emit('joined lobby', this.id);
  }

  startGame() {
    this.inProgress = true;
    this.world.startGame();
  }
}
Lobby.lobbyID = 0;

module.exports = Lobby;
