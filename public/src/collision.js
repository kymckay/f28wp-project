import Vector from './vector';

export default function circleCircle(a, b) {
  const diff = Vector.copy(b.pos);
  diff.sub(a.pos);
  const dSq = diff.lengthSq();
  const rSq = (a.radius + b.radius) * (a.radius + b.radius);
  return (dSq <= rSq);
}
