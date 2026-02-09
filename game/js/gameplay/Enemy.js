import * as THREE from 'three';
import { AssetFactory } from '../engine/AssetFactory.js';

const STATES = {
  IDLE: 'idle',
  PATROL: 'patrol',
  CHASE: 'chase',
  ATTACK: 'attack',
  DEAD: 'dead',
};

export class Enemy {
  constructor(scene, type, position) {
    this.scene = scene;
    this.type = type;
    this.mesh = AssetFactory.createEnemy(type.color, type.scale);
    this.mesh.position.copy(position);
    scene.add(this.mesh);

    this.health = type.health;
    this.maxHealth = type.health;
    this.speed = type.speed;
    this.alive = true;
    this.state = STATES.IDLE;

    // AI
    this.detectionRange = type.detectionRange;
    this.attackRange = type.attackRange;
    this.fireRate = type.fireRate;
    this._fireCooldown = 1 + Math.random() * 2; // stagger first shot
    this._stateTimer = 0.5 + Math.random() * 1; // initial idle delay

    // Patrol
    this._patrolTarget = this._randomPatrolPoint(position);
    this._patrolOrigin = position.clone();

    // Flash effect
    this._flashTimer = 0;

    // Death animation
    this._deathTimer = 0;

    // Bounding box
    this.halfWidth = 0.45 * type.scale;
    this.halfDepth = 0.25 * type.scale;
    this.height = 2.8 * type.scale;

    // Separation
    this._separationForce = new THREE.Vector3();
  }

  update(deltaTime, playerPosition, obstacles, bulletManager, audioManager, allEnemies) {
    // Flash timer
    if (this._flashTimer > 0) {
      this._flashTimer -= deltaTime;
      if (this._flashTimer <= 0) {
        AssetFactory.unflashEnemy(this.mesh);
      }
    }

    if (this.state === STATES.DEAD) {
      this._deathTimer += deltaTime;
      const t = Math.min(this._deathTimer / 0.4, 1);
      this.mesh.scale.setScalar(1 - t);
      this.mesh.position.y = -t * 0.5;
      if (this._deathTimer >= 0.5) {
        this.mesh.visible = false;
      }
      return;
    }

    const distToPlayer = this.mesh.position.distanceTo(playerPosition);

    // State transitions
    this._stateTimer -= deltaTime;

    switch (this.state) {
      case STATES.IDLE:
        if (this._stateTimer <= 0) {
          this.state = STATES.PATROL;
        }
        if (distToPlayer < this.detectionRange) {
          this.state = STATES.CHASE;
        }
        break;

      case STATES.PATROL:
        this._moveToward(this._patrolTarget, this.speed, deltaTime, obstacles, allEnemies);
        const distToTarget = this.mesh.position.distanceTo(this._patrolTarget);
        if (distToTarget < 1.5) {
          this._patrolTarget = this._randomPatrolPoint(this._patrolOrigin);
        }
        if (distToPlayer < this.detectionRange) {
          this.state = STATES.CHASE;
        }
        break;

      case STATES.CHASE:
        this._moveToward(playerPosition, this.type.chaseSpeed, deltaTime, obstacles, allEnemies);
        if (distToPlayer < this.attackRange) {
          this.state = STATES.ATTACK;
        }
        if (distToPlayer > this.detectionRange * 1.5) {
          this.state = STATES.PATROL;
          this._patrolOrigin.copy(this.mesh.position);
          this._patrolTarget = this._randomPatrolPoint(this._patrolOrigin);
        }
        break;

      case STATES.ATTACK:
        // Face player
        this._facePosition(playerPosition);

        // Slow approach if too far
        if (distToPlayer > this.attackRange * 0.8) {
          this._moveToward(playerPosition, this.type.chaseSpeed * 0.5, deltaTime, obstacles, allEnemies);
        }

        // Back to chase if player moves out of range
        if (distToPlayer > this.attackRange * 1.3) {
          this.state = STATES.CHASE;
        }

        // Fire
        this._fireCooldown -= deltaTime;
        if (this._fireCooldown <= 0) {
          this._shoot(playerPosition, bulletManager, audioManager);
          this._fireCooldown = 1 / this.fireRate;
        }
        break;
    }
  }

  takeDamage(amount) {
    if (!this.alive) return false;
    this.health -= amount;
    this._flashTimer = 0.1;
    AssetFactory.flashEnemy(this.mesh);

    // Aggro immediately
    if (this.state === STATES.IDLE || this.state === STATES.PATROL) {
      this.state = STATES.CHASE;
    }

    if (this.health <= 0) {
      this.health = 0;
      this.alive = false;
      this.state = STATES.DEAD;
      this._deathTimer = 0;
      return true; // died
    }
    return false;
  }

  getPosition() {
    return this.mesh.position;
  }

  isAlive() {
    return this.alive && this.state !== STATES.DEAD;
  }

  isRemovable() {
    return this.state === STATES.DEAD && this._deathTimer >= 0.5;
  }

  _moveToward(target, speed, deltaTime, obstacles, allEnemies) {
    const dir = new THREE.Vector3()
      .subVectors(target, this.mesh.position);
    dir.y = 0;
    const dist = dir.length();
    if (dist < 0.1) return;
    dir.normalize();

    // Separation from other enemies
    this._separationForce.set(0, 0, 0);
    for (const other of allEnemies) {
      if (other === this || !other.isAlive()) continue;
      const diff = new THREE.Vector3().subVectors(this.mesh.position, other.mesh.position);
      diff.y = 0;
      const d = diff.length();
      if (d < 2 && d > 0) {
        diff.normalize().multiplyScalar((2 - d) / 2);
        this._separationForce.add(diff);
      }
    }

    dir.add(this._separationForce.multiplyScalar(0.5));
    dir.normalize();

    const moveX = dir.x * speed * deltaTime;
    const moveZ = dir.z * speed * deltaTime;

    const newX = this.mesh.position.x + moveX;
    const newZ = this.mesh.position.z + moveZ;

    if (!this._checkCollision(newX, this.mesh.position.z, obstacles)) {
      this.mesh.position.x = newX;
    }
    if (!this._checkCollision(this.mesh.position.x, newZ, obstacles)) {
      this.mesh.position.z = newZ;
    }

    this._facePosition(target);
  }

  _facePosition(target) {
    const dx = target.x - this.mesh.position.x;
    const dz = target.z - this.mesh.position.z;
    const angle = Math.atan2(dx, dz);
    // Smooth rotation
    let diff = angle - this.mesh.rotation.y;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    this.mesh.rotation.y += diff * 0.1;
  }

  _shoot(playerPosition, bulletManager, audioManager) {
    const gunTip = this.mesh.getObjectByName('gunTip');
    const spawnPos = new THREE.Vector3();
    if (gunTip) {
      gunTip.getWorldPosition(spawnPos);
    } else {
      spawnPos.copy(this.mesh.position).add(new THREE.Vector3(0, 1.4, 0.5));
    }

    // Direction to player with inaccuracy
    const dir = new THREE.Vector3().subVectors(playerPosition, spawnPos);
    dir.y = 0; // keep bullets level
    dir.normalize();

    // Add spread based on accuracy
    const spread = (1 - this.type.accuracy) * 0.5;
    dir.x += (Math.random() - 0.5) * spread;
    dir.z += (Math.random() - 0.5) * spread;
    dir.normalize();

    bulletManager.fire(spawnPos, dir, 30, this.type.damage, true);
    audioManager.playEnemyShoot();
  }

  _randomPatrolPoint(origin) {
    const range = 8;
    return new THREE.Vector3(
      origin.x + (Math.random() - 0.5) * range * 2,
      0,
      origin.z + (Math.random() - 0.5) * range * 2
    );
  }

  _checkCollision(x, z, obstacles) {
    for (const obs of obstacles) {
      const oMinX = obs.position.x - obs.halfWidth;
      const oMaxX = obs.position.x + obs.halfWidth;
      const oMinZ = obs.position.z - obs.halfDepth;
      const oMaxZ = obs.position.z + obs.halfDepth;

      if (x + this.halfWidth > oMinX && x - this.halfWidth < oMaxX &&
          z + this.halfDepth > oMinZ && z - this.halfDepth < oMaxZ) {
        return true;
      }
    }
    return false;
  }

  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.traverse((child) => {
      if (child.isMesh) {
        child.geometry?.dispose();
        child.material?.dispose();
      }
    });
  }
}
