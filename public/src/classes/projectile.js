import Entity from './entity';

export default class Projectile extends Entity {
  constructor(container, id, pos, angle, velocity) {
    super(container, id, pos, velocity);
    this.angle = angle;

    this.element.classList.add('projectile');
    
    this.lastProjectile = performance.now();
  }

  render(screenOX, screenOY) {
    if (this.isExpired()) {
      this.removeProjectile();
      return null;
    }
    super.render(screenOX, screenOY);

    this.element.style.transform = `translate(-50%, -50%) rotate(${this.angle}rad)`;
  }

  //check if the projectile should expire
  isExpired() {
    if (performance.now() - this.lastProjectile >= projectile.expirationTime){
      return true;
    }
    return false;
  }

  //remove the projectile
  removeProjectile() {
    this.remove();
  }
}

//Constants for projectile behaviour
projectiles.expirationTime = 2000; //ms for how long the projectiles exist
