import * as THREE from 'three';
import { Renderer } from './Renderer.js';
import { InputManager } from './InputManager.js';
import { AudioManager } from './AudioManager.js';
import { Player } from '../gameplay/Player.js';
import { Weapon } from '../gameplay/Weapon.js';
import { BulletManager } from '../gameplay/Bullet.js';
import { Arena } from '../world/Arena.js';
import { LevelManager } from '../world/LevelManager.js';
import { HUD } from '../ui/HUD.js';
import { MenuScreen } from '../ui/MenuScreen.js';
import { TouchControls } from '../ui/TouchControls.js';

const STATES = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  LEVEL_COMPLETE: 'level_complete',
  GAME_OVER: 'game_over',
  VICTORY: 'victory',
};

export class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.state = STATES.MENU;
    this.lastTime = 0;
    this.totalKilled = 0;

    // Systems
    this.renderer = new Renderer(canvas);
    this.input = new InputManager(canvas);
    this.audio = new AudioManager();
    this.hud = new HUD();
    this.menu = new MenuScreen();
    this.touchControls = new TouchControls();

    // Game objects
    this.player = null;
    this.weapon = null;
    this.bulletManager = null;
    this.arena = new Arena(this.renderer.scene);
    this.levelManager = new LevelManager(this.renderer.scene);

    // Muzzle flash
    this._muzzleFlashTimer = 0;

    // Particles
    this._particles = [];
  }

  init() {
    // Setup touch if on touch device
    if (this.input.isTouchDevice) {
      this.touchControls.show();
      this.input.setupTouchControls(this.touchControls);
      this.touchControls.onReload = () => { this.input.reloadPressed = true; };
      this.touchControls.onPause = () => { this.input.pausePressed = true; };
    }

    // Menu callbacks
    this.menu.onStart = () => this._startGame();
    this.menu.onResume = () => this._resume();
    this.menu.onQuit = () => this._quitToMenu();
    this.menu.onNextLevel = () => this._nextLevel();
    this.menu.onRetry = () => this._retry();

    // Show menu
    this.menu.showMenu();
    this.hud.hide();

    // Start render loop
    this._loop(0);
  }

  _loop(time) {
    requestAnimationFrame((t) => this._loop(t));

    const deltaTime = Math.min((time - this.lastTime) / 1000, 1 / 30); // cap at ~33ms
    this.lastTime = time;

    if (this.state === STATES.PLAYING) {
      this._update(deltaTime);
    }

    this.renderer.render();
  }

  _update(deltaTime) {
    // Pause
    if (this.input.consumePause()) {
      this._pause();
      return;
    }

    // Reload
    if (this.input.consumeReload() && this.weapon) {
      if (this.weapon.startReload()) {
        this.audio.playReload();
      }
    }

    // Update weapon
    this.weapon.update(deltaTime);

    // Update player
    this.player.update(deltaTime, this.input, this.renderer, this.arena.getColliders());

    // Shooting
    if (this.input.isShooting() && this.weapon.canFire()) {
      if (this.weapon.fire()) {
        const gunTip = this.player.getGunTipWorld();
        const aimDir = this.player.getAimDirection(this.renderer);
        this.bulletManager.fire(gunTip, aimDir, this.weapon.bulletSpeed, this.weapon.damage, false);
        this.audio.playShoot();
        this.player.shotsFired++;
      }
    }

    // Update bullets
    this.bulletManager.update(deltaTime, this.arena.getColliders());

    // Check player bullets vs enemies
    const playerBullets = this.bulletManager.getActivePlayerBullets();
    for (const bullet of playerBullets) {
      const bPos = this.bulletManager.getBulletPosition(bullet);
      for (const enemy of this.levelManager.enemies) {
        if (!enemy.isAlive()) continue;
        const ePos = enemy.getPosition();
        const dx = Math.abs(bPos.x - ePos.x);
        const dz = Math.abs(bPos.z - ePos.z);
        const dy = bPos.y;

        if (dx < enemy.halfWidth + 0.1 && dz < enemy.halfDepth + 0.1 && dy < enemy.height && dy >= 0) {
          const died = enemy.takeDamage(bullet.damage);
          this.bulletManager.deactivateBullet(bullet);
          this.audio.playHit();
          this.hud.flashCrosshairHit();
          this.player.shotsHit++;

          if (died) {
            this.audio.playEnemyDeath();
            this.levelManager.onEnemyKilled();
            this.totalKilled++;
            this._spawnDeathParticles(ePos);
          }
          break;
        }
      }
    }

    // Check enemy bullets vs player
    const enemyBullets = this.bulletManager.getActiveEnemyBullets();
    for (const bullet of enemyBullets) {
      const bPos = this.bulletManager.getBulletPosition(bullet);
      const pPos = this.player.getPosition();
      const dx = Math.abs(bPos.x - pPos.x);
      const dz = Math.abs(bPos.z - pPos.z);
      const dy = bPos.y;

      if (dx < this.player.halfWidth + 0.1 && dz < this.player.halfDepth + 0.1 && dy < 3 && dy >= 0) {
        this.player.takeDamage(bullet.damage);
        this.bulletManager.deactivateBullet(bullet);
        this.audio.playPlayerHit();
        this.hud.flashDamage();

        if (!this.player.alive) {
          this._gameOver();
          return;
        }
      }
    }

    // Update level manager (enemies)
    this.levelManager.update(
      deltaTime,
      this.player.getPosition(),
      this.arena.getColliders(),
      this.bulletManager,
      this.audio
    );

    // Check level complete
    if (this.levelManager.isLevelComplete()) {
      this._levelComplete();
      return;
    }

    // Update camera
    this.renderer.updateCamera(this.player.getPosition(), deltaTime);

    // Update particles
    this._updateParticles(deltaTime);

    // Update HUD
    this.hud.update(this.player, this.weapon, this.levelManager, deltaTime);
  }

  _startGame() {
    this.audio.init();
    this.totalKilled = 0;
    this._loadLevel(0);
    this.state = STATES.PLAYING;
    this.menu.hideAll();
    this.hud.show();
    if (!this.input.isTouchDevice) {
      this.canvas.requestPointerLock();
    }
  }

  _loadLevel(index) {
    // Clean up previous
    if (this.player) {
      this.renderer.scene.remove(this.player.mesh);
    }
    this.bulletManager?.reset();

    // Build arena
    const level = this.levelManager.getCurrentLevel() || { skyColor: 0x1a1a2e };
    this.levelManager.startLevel(index);
    const levelData = this.levelManager.getCurrentLevel();
    this.arena.build(levelData);
    this.renderer.setSceneColors(levelData.skyColor, levelData.skyColor);

    // Create/reset player
    this.player = new Player(this.renderer.scene);
    this.player.reset(levelData.playerSpawn);

    // Weapon
    this.weapon = new Weapon();

    // Bullet manager
    if (!this.bulletManager) {
      this.bulletManager = new BulletManager(this.renderer.scene);
    } else {
      this.bulletManager.reset();
    }

    // Reset camera
    this.renderer.cameraYaw = 0;
    this.renderer.cameraPitch = 0.3;
  }

  _pause() {
    this.state = STATES.PAUSED;
    this.menu.showPause();
    this.input.releasePointerLock();
  }

  _resume() {
    this.state = STATES.PLAYING;
    this.menu.hidePause();
    if (!this.input.isTouchDevice) {
      this.canvas.requestPointerLock();
    }
  }

  _levelComplete() {
    this.state = STATES.LEVEL_COMPLETE;
    this.input.releasePointerLock();
    this.audio.playLevelComplete();

    const stats = this.levelManager.getStats();
    stats.shotsFired = this.player.shotsFired;
    stats.shotsHit = this.player.shotsHit;

    if (this.levelManager.isLastLevel()) {
      this.menu.showVictory({
        totalLevels: this.levelManager.getTotalLevels(),
        totalKilled: this.totalKilled,
      });
      this.state = STATES.VICTORY;
    } else {
      this.menu.showLevelComplete(stats);
    }
  }

  _nextLevel() {
    const nextIndex = this.levelManager.currentLevelIndex + 1;
    this._loadLevel(nextIndex);
    this.state = STATES.PLAYING;
    this.menu.hideAll();
    if (!this.input.isTouchDevice) {
      this.canvas.requestPointerLock();
    }
  }

  _retry() {
    this._loadLevel(this.levelManager.currentLevelIndex);
    this.state = STATES.PLAYING;
    this.menu.hideAll();
    if (!this.input.isTouchDevice) {
      this.canvas.requestPointerLock();
    }
  }

  _gameOver() {
    this.state = STATES.GAME_OVER;
    this.input.releasePointerLock();
    this.audio.playGameOver();

    const stats = this.levelManager.getStats();
    this.menu.showGameOver(stats);
  }

  _quitToMenu() {
    this.state = STATES.MENU;
    this.input.releasePointerLock();

    // Clean up
    this.levelManager.clearAll();
    this.arena.clear();
    this.bulletManager?.reset();
    if (this.player) {
      this.renderer.scene.remove(this.player.mesh);
      this.player = null;
    }
    this._clearParticles();

    this.hud.hide();
    this.menu.showMenu();
  }

  _spawnDeathParticles(position) {
    const count = 10;
    for (let i = 0; i < count; i++) {
      const speed = 3 + Math.random() * 5;
      const angle = Math.random() * Math.PI * 2;
      const upSpeed = 2 + Math.random() * 4;

      // Use a simple box mesh
      const geo = new THREE.BoxGeometry(0.15, 0.15, 0.15);
      const mat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffaa44,
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        position.x + (Math.random() - 0.5),
        position.y + 1 + Math.random(),
        position.z + (Math.random() - 0.5)
      );

      this.renderer.scene.add(mesh);

      this._particles.push({
        mesh,
        vx: Math.cos(angle) * speed,
        vy: upSpeed,
        vz: Math.sin(angle) * speed,
        life: 0.5 + Math.random() * 0.3,
      });
    }
  }

  _updateParticles(deltaTime) {
    for (let i = this._particles.length - 1; i >= 0; i--) {
      const p = this._particles[i];
      p.mesh.position.x += p.vx * deltaTime;
      p.mesh.position.y += p.vy * deltaTime;
      p.mesh.position.z += p.vz * deltaTime;
      p.vy -= 15 * deltaTime; // gravity
      p.life -= deltaTime;

      const t = Math.max(0, p.life / 0.5);
      p.mesh.scale.setScalar(t);

      if (p.life <= 0) {
        this.renderer.scene.remove(p.mesh);
        p.mesh.geometry.dispose();
        p.mesh.material.dispose();
        this._particles.splice(i, 1);
      }
    }
  }

  _clearParticles() {
    for (const p of this._particles) {
      this.renderer.scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      p.mesh.material.dispose();
    }
    this._particles = [];
  }
}
