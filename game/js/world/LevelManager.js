import * as THREE from 'three';
import { LEVELS } from './LevelData.js';
import { ENEMY_TYPES } from '../gameplay/EnemyTypes.js';
import { Enemy } from '../gameplay/Enemy.js';

export class LevelManager {
  constructor(scene) {
    this.scene = scene;
    this.currentLevelIndex = 0;
    this.currentWaveIndex = 0;
    this.enemies = [];
    this.totalEnemiesInLevel = 0;
    this.enemiesKilled = 0;
    this.waveTimer = 0;
    this.waveActive = false;
    this.levelComplete = false;
    this.allWavesSpawned = false;
    this.levelStartTime = 0;
  }

  getCurrentLevel() {
    return LEVELS[this.currentLevelIndex];
  }

  getTotalLevels() {
    return LEVELS.length;
  }

  getLevelNumber() {
    return this.currentLevelIndex + 1;
  }

  startLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    this.currentWaveIndex = 0;
    this.enemiesKilled = 0;
    this.levelComplete = false;
    this.allWavesSpawned = false;
    this.levelStartTime = performance.now();

    // Clear old enemies
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    this.enemies = [];

    // Count total enemies in level
    const level = this.getCurrentLevel();
    this.totalEnemiesInLevel = 0;
    for (const wave of level.waves) {
      for (const group of wave.enemies) {
        this.totalEnemiesInLevel += group.count;
      }
    }

    // Spawn first wave
    this._spawnWave();
  }

  update(deltaTime, playerPosition, obstacles, bulletManager, audioManager) {
    // Update all enemies
    for (const enemy of this.enemies) {
      enemy.update(deltaTime, playerPosition, obstacles, bulletManager, audioManager, this.enemies);
    }

    // Remove dead enemies that finished death animation
    this.enemies = this.enemies.filter(e => {
      if (e.isRemovable()) {
        e.dispose();
        return false;
      }
      return true;
    });

    // Check if current wave is cleared
    const aliveCount = this.enemies.filter(e => e.isAlive()).length;

    if (aliveCount === 0 && !this.levelComplete) {
      if (this.allWavesSpawned) {
        this.levelComplete = true;
      } else {
        // Wait for wave delay then spawn next
        const level = this.getCurrentLevel();
        if (this.currentWaveIndex < level.waves.length) {
          this.waveTimer -= deltaTime;
          if (this.waveTimer <= 0) {
            this._spawnWave();
          }
        }
      }
    }
  }

  isLevelComplete() {
    return this.levelComplete;
  }

  isLastLevel() {
    return this.currentLevelIndex >= LEVELS.length - 1;
  }

  getStats() {
    const elapsed = (performance.now() - this.levelStartTime) / 1000;
    return {
      level: this.getLevelNumber(),
      name: this.getCurrentLevel().name,
      killed: this.enemiesKilled,
      total: this.totalEnemiesInLevel,
      time: elapsed,
      aliveCount: this.enemies.filter(e => e.isAlive()).length,
    };
  }

  onEnemyKilled() {
    this.enemiesKilled++;
  }

  _spawnWave() {
    const level = this.getCurrentLevel();
    if (this.currentWaveIndex >= level.waves.length) {
      this.allWavesSpawned = true;
      return;
    }

    const wave = level.waves[this.currentWaveIndex];

    for (const group of wave.enemies) {
      const type = ENEMY_TYPES[group.type];
      for (let i = 0; i < group.count; i++) {
        const pos = this._randomSpawnPos(wave.spawnZone);
        const enemy = new Enemy(this.scene, type, pos);
        this.enemies.push(enemy);
      }
    }

    this.currentWaveIndex++;

    // Set timer for next wave
    if (this.currentWaveIndex < level.waves.length) {
      this.waveTimer = level.waves[this.currentWaveIndex].delay;
    } else {
      this.allWavesSpawned = true;
    }

    this.waveActive = true;
  }

  _randomSpawnPos(zone) {
    return new THREE.Vector3(
      zone.minX + Math.random() * (zone.maxX - zone.minX),
      0,
      zone.minZ + Math.random() * (zone.maxZ - zone.minZ)
    );
  }

  clearAll() {
    for (const enemy of this.enemies) {
      enemy.dispose();
    }
    this.enemies = [];
  }
}
