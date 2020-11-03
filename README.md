# F28WP-Project
Web based game group project for web programming course.

Check out [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on setting up for development as well as details on testing, deployment and style standards.

## Our Game

Our initial game idea was an asteroids-inspired battle royale in which players pilot a ship with a cannon and try to destroy each other and avoid asteroids.

Currently we're working towards getting a basic networked game with multiple player ships in the same single lobby and synchronising the position of all game entties across the lobby.

Desired features:
- Collision interactions between player ships, asteroids and projectiles.
- Defined scoring system and gameplay elements (possibly HP, powerups, etc.).
- Sign up/in system with backend database to track users and high scores (with guest sign in option for quick play).
- Possible lobby system to manage amount of players in a game instance and reduce networking load per game.
- Basic text chat system.
- Anti-cheat measures (ensuring clients are sending reasonable gameplay data to server, etc.).
- Security measures (preventing SQL injection, handling many client instances from the same IP, etc.).
