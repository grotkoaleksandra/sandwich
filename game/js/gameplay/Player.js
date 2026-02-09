import * as THREE from 'three';
import { AssetFactory } from '../engine/AssetFactory.js';

export class Player {
  constructor(scene) {
    this.scene = scene;
    this.mesh = AssetFactory.createPlayer();
    this.mesh.position.set(0, 0, 0);
    scene.add(this.mesh);

    // Stats
    this.health = 100;
    this.maxHealth = 100;
    this.speed = 8;
    this.sprintSpeed = 12;
    this.alive = true;

    // Regen
    this.regenRate = 5; // HP per second
    this.regenDelay = 3; // seconds after last hit
    this.timeSinceHit = 999;

    // Aim direction (world space, on XZ plane)
    this.aimAngle = 0;

    // Bounding box for collision
    this.halfWidth = 0.5;
    this.halfDepth = 0.3;

    // Stats tracking
    this.shotsFired = 0;
    this.shotsHit = 0;
  }

  update(deltaTime, input, renderer, obstacles) {
    if (!this.alive) return;

    const movement = input.getMovement();
    const aimDelta = input.getAimDelta();

    // Update camera orbit from aim input
    const sensitivity = 0.003;
    renderer.cameraYaw += aimDelta.x * sensitivity;
    renderer.cameraPitch = Math.max(-0.2, Math.min(1.0,
      renderer.cameraPitch + aimDelta.y * sensitivity
    ));

    // Movement relative to camera
    if (movement.x !== 0 || movement.y !== 0) {
      const forward = renderer.getCameraForward();
      const right = renderer.getCameraRight();
      const speed = input.isSprinting() ? this.sprintSpeed : this.speed;

      const moveX = (forward.x * movement.y + right.x * movement.x) * speed * deltaTime;
      const moveZ = (forward.z * movement.y + right.z * movement.x) * speed * deltaTime;

      // Try X movement
      const newX = this.mesh.position.x + moveX;
      if (!this._checkCollision(newX, this.mesh.position.z, obstacles)) {
        this.mesh.position.x = newX;
      }

      // Try Z movement
      const newZ = this.mesh.position.z + moveZ;
      if (!this._checkCollision(this.mesh.position.x, newZ, obstacles)) {
        this.mesh.position.z = newZ;
      }

      // Rotate player to face movement direction
      const moveAngle = Math.atan2(moveX, moveZ);
      this.mesh.rotation.y = this._lerpAngle(this.mesh.rotation.y, moveAngle, 0.15);
    }

    // When shooting, face aim direction instead
    if (input.isShooting()) {
      const forward = renderer.getCameraForward();
      this.aimAngle = Math.atan2(forward.x, forward.z);
      this.mesh.rotation.y = this._lerpAngle(this.mesh.rotation.y, this.aimAngle, 0.3);
    }

    // Health regen
    this.timeSinceHit += deltaTime;
    if (this.timeSinceHit >= this.regenDelay && this.health < this.maxHealth) {
      this.health = Math.min(this.maxHealth, this.health + this.regenRate * deltaTime);
    }
  }

  takeDamage(amount) {
    if (!this.alive) return;
    this.health -= amount;
    this.timeSinceHit = 0;
    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
    }
  }

  getPosition() {
    return this.mesh.position;
  }

  getGunTipWorld() {
    const gunTip = this.mesh.getObjectByName('gunTip');
    if (gunTip) {
      const pos = new THREE.Vector3();
      gunTip.getWorldPosition(pos);
      return pos;
    }
    return this.mesh.position.clone().add(new THREE.Vector3(0, 1.5, 0.8));
  }

  getAimDirection(renderer) {
    const forward = renderer.getCameraForward();
    return forward;
  }

  reset(position) {
    if (position) {
      if (position.isVector3) {
        this.mesh.position.copy(position);
      } else {
        this.mesh.position.set(position.x || 0, position.y || 0, position.z || 0);
      }
    } else {
      this.mesh.position.set(0, 0, 0);
    }
    this.health = this.maxHealth;
    this.alive = true;
    this.timeSinceHit = 999;
    this.shotsFired = 0;
    this.shotsHit = 0;
  }

  _checkCollision(x, z, obstacles) {
    for (const obs of obstacles) {
      const oMinX = obs.position.x - obs.halfWidth;
      const oMaxX = obs.position.x + obs.halfWidth;
      const oMinZ = obs.position.z - obs.halfDepth;
      const oMaxZ = obs.position.z + obs.halfDepth;

      const pMinX = x - this.halfWidth;
      const pMaxX = x + this.halfWidth;
      const pMinZ = z - this.halfDepth;
      const pMaxZ = z + this.halfDepth;

      if (pMaxX > oMinX && pMinX < oMaxX && pMaxZ > oMinZ && pMinZ < oMaxZ) {
        return true;
      }
    }
    return false;
  }

  _lerpAngle(a, b, t) {
    let diff = b - a;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return a + diff * t;
  }
}
