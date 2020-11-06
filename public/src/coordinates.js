export default function worldToScreen(worldX, worldY, screenOX, screenOY) {
  // Convert coordinate system by subtracting new origin vector
  return [worldX - screenOX, worldY - screenOY];
}
