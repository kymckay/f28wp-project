function circleCircle(a, b) {
    let diff = vector.copy(b.pos);
    diff.sub(a.pos);
    const dSq = diff.lengthSq();
    const rSq = (a.radius + b.radius) * (a.radius + b.radius);
    if (dSq <= rSq)
        return true;
    else
        return false;
}