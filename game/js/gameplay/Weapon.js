export class Weapon {
  constructor() {
    this.fireRate = 6; // rounds per second
    this.magSize = 30;
    this.ammo = 30;
    this.reloadTime = 1.5; // seconds
    this.damage = 12;
    this.bulletSpeed = 50;

    this._fireCooldown = 0;
    this._reloading = false;
    this._reloadTimer = 0;
  }

  update(deltaTime) {
    if (this._fireCooldown > 0) {
      this._fireCooldown -= deltaTime;
    }
    if (this._reloading) {
      this._reloadTimer -= deltaTime;
      if (this._reloadTimer <= 0) {
        this.ammo = this.magSize;
        this._reloading = false;
      }
    }
  }

  canFire() {
    return !this._reloading && this._fireCooldown <= 0 && this.ammo > 0;
  }

  fire() {
    if (!this.canFire()) return false;
    this.ammo--;
    this._fireCooldown = 1 / this.fireRate;
    if (this.ammo <= 0) {
      this.startReload();
    }
    return true;
  }

  startReload() {
    if (this._reloading || this.ammo === this.magSize) return false;
    this._reloading = true;
    this._reloadTimer = this.reloadTime;
    return true;
  }

  isReloading() {
    return this._reloading;
  }

  reset() {
    this.ammo = this.magSize;
    this._fireCooldown = 0;
    this._reloading = false;
    this._reloadTimer = 0;
  }
}
