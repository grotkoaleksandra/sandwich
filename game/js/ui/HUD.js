export class HUD {
  constructor() {
    this.el = document.getElementById('hud');
    this.healthBar = document.getElementById('health-bar-fill');
    this.healthText = document.getElementById('health-text');
    this.levelText = document.getElementById('hud-level');
    this.killsText = document.getElementById('hud-kills');
    this.ammoCurrent = document.getElementById('ammo-current');
    this.ammoMax = document.getElementById('ammo-max');
    this.reloadIndicator = document.getElementById('reload-indicator');
    this.damageVignette = document.getElementById('damage-vignette');
    this.crosshair = document.getElementById('crosshair');

    this._vignetteTimer = 0;
  }

  show() {
    this.el.classList.remove('hidden');
  }

  hide() {
    this.el.classList.add('hidden');
  }

  update(player, weapon, levelManager, deltaTime) {
    // Health
    const healthPct = (player.health / player.maxHealth) * 100;
    this.healthBar.style.width = healthPct + '%';
    this.healthText.textContent = Math.ceil(player.health);

    // Color health bar based on value
    if (healthPct > 60) {
      this.healthBar.style.background = 'linear-gradient(90deg, #44cc44, #66ee66)';
    } else if (healthPct > 30) {
      this.healthBar.style.background = 'linear-gradient(90deg, #ccaa22, #eecc44)';
    } else {
      this.healthBar.style.background = 'linear-gradient(90deg, #ff4051, #ff6b6b)';
    }

    // Ammo
    this.ammoCurrent.textContent = weapon.ammo;
    this.ammoMax.textContent = weapon.magSize;
    if (weapon.isReloading()) {
      this.reloadIndicator.classList.remove('hidden');
    } else {
      this.reloadIndicator.classList.add('hidden');
    }

    // Level & kills
    const stats = levelManager.getStats();
    this.levelText.textContent = `LEVEL ${stats.level} — ${stats.name}`;
    this.killsText.textContent = `${stats.killed} / ${stats.total}`;

    // Damage vignette
    if (this._vignetteTimer > 0) {
      this._vignetteTimer -= deltaTime;
      if (this._vignetteTimer <= 0) {
        this.damageVignette.classList.remove('active');
      }
    }
  }

  flashDamage() {
    this.damageVignette.classList.add('active');
    this._vignetteTimer = 0.2;
  }

  flashCrosshairHit() {
    this.crosshair.classList.add('hit');
    setTimeout(() => this.crosshair.classList.remove('hit'), 100);
  }
}
