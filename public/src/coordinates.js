export function worldToScreen(worldX, worldY, screenOX, screenOY) {
  // Convert coordinate system by subtracting new origin vector
  return [worldX - screenOX, worldY - screenOY];
}

export function polarToCart(theta, z) {
  return [
    // Angles in this world are measured clockwise from north
    Math.sin(theta) * z,
    Math.cos(theta) * z,
  ];
}

export function vectorAdd(v1, v2) {
  return [
    v1[0] + v2[0],
    v1[1] + v2[1],
  ];
}
