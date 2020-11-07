export function worldToScreen(worldCoord, screenO) {
  // Convert coordinate system by subtracting new origin vector
  return vectorDiff(worldCoord, screenO);
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

export function vectorDiff(v1, v2) {
  return [
    v1[0] - v2[0],
    v1[1] - v2[1],
  ];
}
