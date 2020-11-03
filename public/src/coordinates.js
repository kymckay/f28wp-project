export default function worldToScreen(worldX, worldY, playerShip) {
  // Find top left (origin) of screen in world coordinates
  // Player's ship is always centered
  const screenOX = playerShip.x - window.innerWidth / 2;
  const screenOY = playerShip.y - window.innerHeight / 2;

  // Convert coordinate system by subtracting new origin vector
  const screenX = worldX - screenOX;
  const screenY = worldY - screenOY;

  return [screenX, screenY];
}
