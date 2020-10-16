# F28WP-Project
Web based game group project for web programming course.

Check out [CONTRIBUTING.md](CONTRIBUTING.md) for instructions on setting up for development as well as details on testing, deployment and style standards.

## Our Game

Our initial game idea was an asteroids-inspired battle royale in which players pilot a ship with a cannon and try to destroy eachother and avoid asteroids.

Currently we're working on the mechanics client-side as a singleplayer implementation while we set up the initial server side code with the aim to reach self-sustaining development (i.e. implementing features, fixing bugs, without any big setup hurdles). We also intent to set up unit testing for a test driven development workflow.

Desired features:
- Collision interactions between player ships, asteroids and projectiles.
- Defined scoring system and gameplay elements (possibly HP, powerups, etc.).
- Sign up/in system with backend database to track users and high scores (with guest sign in option for quick play).
- Possible lobby system to manage amount of players in a game instance and reduce networking load per game.
- Basic text chat system.
- Anti-cheat measures (ensuring clients are sending reasonable gameplay data to server, etc.).
- Security measures (preventing SQL injection, handling many client instances from the same IP, etc.).
