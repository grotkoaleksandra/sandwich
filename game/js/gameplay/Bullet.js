import * as THREE from 'three';
import { AssetFactory } from '../engine/AssetFactory.js';

const MAX_BULLETS = 60;

export class BulletManager {
  constructor(scene) {
    this.scene = scene;
    this.bullets = [];

    // Pre-allocate bullet pool
    for (let i = 0; i < MAX_BULLETS; i++) {
      const playerBullet = AssetFactory.createBullet(false);
      playerBullet.visible = false;
      scene.add(playerBullet);

      const enemyBullet = AssetFactory.createBullet(true);
      enemyBullet.visible = false;
      scene.add(enemyBullet);

      this.bullets.push({
        meshPlayer: playerBullet,
        meshEnemy: enemyBullet,
        active: false,
        isEnemy: false,
        velocity: new THREE.Vector3(),
        lifetime: 0,
        damage: 0,
      });
    }
  }

  fire(position, direction, speed, damage, isEnemy = false) {
    // Find inactive bullet
    const bullet = this.bullets.find(b => !b.active);
    if (!bullet) return;

    bullet.active = true;
    bullet.isEnemy = isEnemy;
    bullet.damage = damage;
    bullet.lifetime = 2; // seconds

    const mesh = isEnemy ? bullet.meshEnemy : bullet.meshPlayer;
    mesh.visible = true;
    mesh.position.copy(position);

    bullet.velocity.copy(direction).normalize().multiplyScalar(speed);

    // Hide the other mesh
    const otherMesh = isEnemy ? bullet.meshPlayer : bullet.meshEnemy;
    otherMesh.visible = false;
  }

  update(deltaTime, obstacles) {
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;

      const mesh = bullet.isEnemy ? bullet.meshEnemy : bullet.meshPlayer;

      // Move
      mesh.position.x += bullet.velocity.x * deltaTime;
      mesh.position.y += bullet.velocity.y * deltaTime;
      mesh.position.z += bullet.velocity.z * deltaTime;

      // Lifetime
      bullet.lifetime -= deltaTime;
      if (bullet.lifetime <= 0) {
        this._deactivate(bullet);
        continue;
      }

      // Check wall/obstacle collision
      if (this._checkObstacleCollision(mesh.position, obstacles)) {
        this._deactivate(bullet);
      }
    }
  }

  // Returns array of active player bullets for collision checking
  getActivePlayerBullets() {
    return this.bullets.filter(b => b.active && !b.isEnemy);
  }

  getActiveEnemyBullets() {
    return this.bullets.filter(b => b.active && b.isEnemy);
  }

  getBulletPosition(bullet) {
    const mesh = bullet.isEnemy ? bullet.meshEnemy : bullet.meshPlayer;
    return mesh.position;
  }

  deactivateBullet(bullet) {
    this._deactivate(bullet);
  }

  _deactivate(bullet) {
    bullet.active = false;
    bullet.meshPlayer.visible = false;
    bullet.meshEnemy.visible = false;
  }

  _checkObstacleCollision(pos, obstacles) {
    for (const obs of obstacles) {
      const dx = Math.abs(pos.x - obs.position.x);
      const dz = Math.abs(pos.z - obs.position.z);
      const dy = pos.y;

      if (dx < obs.halfWidth && dz < obs.halfDepth && dy < obs.height && dy >= 0) {
        return true;
      }
    }
    return false;
  }

  reset() {
    for (const bullet of this.bullets) {
      this._deactivate(bullet);
    }
  }
}
