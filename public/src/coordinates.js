export function worldToScreen(worldCoord, screenO) {
  // Convert coordinate system by subtracting new origin vector
  return [
    worldCoord[0] - screenO[0],
    worldCoord[1] - screenO[1],
  ];
}

export function polarToCart(theta, z) {
  return [
    // Angles in this world are measured clockwise from x-axis
    Math.cos(theta) * z,
    Math.sin(theta) * z,
  ];
}

export function vectorAdd(v1, v2) {
  return [
    v1[0] + v2[0],
    v1[1] + v2[1],
  ];
}
