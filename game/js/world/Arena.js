import * as THREE from 'three';
import { AssetFactory } from '../engine/AssetFactory.js';

export class Arena {
  constructor(scene) {
    this.scene = scene;
    this.meshes = [];
    this.colliders = [];
  }

  build(levelData) {
    this.clear();

    const { width, depth } = levelData.arenaSize;
    const floorColor = levelData.floorColor;
    const wallColor = levelData.wallColor || 0x4a3a2e;
    const wallHeight = levelData.wallHeight || 6;
    const wallThick = 1.2;

    // Floor
    const floor = AssetFactory.createFloor(width, depth, floorColor);
    this.scene.add(floor);
    this.meshes.push(floor);

    // Subtle wood plank grid
    const grid = AssetFactory.createFloorGrid(width, depth);
    this.scene.add(grid);
    this.meshes.push(grid);

    // Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x3a2a1e,
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = wallHeight;
    ceiling.receiveShadow = true;
    this.scene.add(ceiling);
    this.meshes.push(ceiling);

    // Walls
    const halfW = width / 2;
    const halfD = depth / 2;

    const walls = [
      { pos: [0, wallHeight / 2, halfD + wallThick / 2], size: [width + wallThick * 2, wallHeight, wallThick] },
      { pos: [0, wallHeight / 2, -halfD - wallThick / 2], size: [width + wallThick * 2, wallHeight, wallThick] },
      { pos: [halfW + wallThick / 2, wallHeight / 2, 0], size: [wallThick, wallHeight, depth] },
      { pos: [-halfW - wallThick / 2, wallHeight / 2, 0], size: [wallThick, wallHeight, depth] },
    ];

    for (const w of walls) {
      const wall = AssetFactory.createWall(w.size[0], w.size[1], w.size[2], wallColor);
      wall.position.set(w.pos[0], w.pos[1], w.pos[2]);
      this.scene.add(wall);
      this.meshes.push(wall);
      this.colliders.push({
        position: { x: w.pos[0], z: w.pos[2] },
        halfWidth: w.size[0] / 2,
        halfDepth: w.size[2] / 2,
        height: w.size[1],
      });
    }

    // Wainscoting
    const trimColor = 0x2a1a10;
    for (const w of walls) {
      const trim = AssetFactory.createWall(w.size[0] + 0.02, 1.2, w.size[2] + 0.04, trimColor);
      trim.position.set(w.pos[0], 0.6, w.pos[2]);
      this.scene.add(trim);
      this.meshes.push(trim);
    }

    // Crown molding
    for (const w of walls) {
      const crown = AssetFactory.createWall(w.size[0] + 0.02, 0.15, w.size[2] + 0.06, 0x5a4a3e);
      crown.position.set(w.pos[0], wallHeight - 0.075, w.pos[2]);
      this.scene.add(crown);
      this.meshes.push(crown);
    }

    // Obstacles (furniture)
    for (const obs of levelData.obstacles) {
      let mesh;
      let hw, hd, h;

      if (obs.type === 'box' || obs.type === 'furniture') {
        mesh = AssetFactory.createObstacle(obs.size[0], obs.size[1], obs.size[2], obs.color || levelData.obstacleColor);
        mesh.position.set(obs.pos[0], obs.size[1] / 2, obs.pos[2]);
        hw = obs.size[0] / 2;
        hd = obs.size[2] / 2;
        h = obs.size[1];
      } else if (obs.type === 'pillar') {
        const pH = obs.size ? obs.size[1] : wallHeight;
        const pR = obs.size ? obs.size[0] : 0.4;
        mesh = AssetFactory.createPillar(pH, pR);
        mesh.position.set(obs.pos[0], 0, obs.pos[2]);
        hw = pR * 1.5;
        hd = pR * 1.5;
        h = pH;
      } else if (obs.type === 'table') {
        const tw = obs.size ? obs.size[0] : 2;
        const td = obs.size ? obs.size[2] : 1;
        mesh = AssetFactory.createTable(tw, td);
        mesh.position.set(obs.pos[0], 0, obs.pos[2]);
        hw = tw / 2;
        hd = td / 2;
        h = 1;
      } else if (obs.type === 'bookshelf') {
        const bw = obs.size ? obs.size[0] : 2;
        const bh = obs.size ? obs.size[1] : 3.5;
        mesh = AssetFactory.createBookshelf(bw, bh);
        mesh.position.set(obs.pos[0], 0, obs.pos[2]);
        if (obs.rotation) mesh.rotation.y = obs.rotation;
        hw = bw / 2;
        hd = 0.3;
        h = bh;
      } else if (obs.type === 'cylinder') {
        mesh = AssetFactory.createCylinder(obs.size[0], obs.size[1], obs.color || levelData.obstacleColor);
        mesh.position.set(obs.pos[0], obs.size[1] / 2, obs.pos[2]);
        hw = obs.size[0];
        hd = obs.size[0];
        h = obs.size[1];
      }

      if (mesh) {
        this.scene.add(mesh);
        this.meshes.push(mesh);
        this.colliders.push({
          position: { x: obs.pos[0], z: obs.pos[2] },
          halfWidth: hw,
          halfDepth: hd,
          height: h,
        });
      }
    }

    // Decorations (no collision)
    if (levelData.decorations) {
      for (const dec of levelData.decorations) {
        let mesh;
        if (dec.type === 'chandelier') {
          mesh = AssetFactory.createChandelier(dec.radius || 1.5);
          mesh.position.set(dec.pos[0], wallHeight - 0.1, dec.pos[2]);
        } else if (dec.type === 'carpet') {
          mesh = AssetFactory.createCarpet(dec.size[0], dec.size[1]);
          mesh.position.set(dec.pos[0], 0, dec.pos[2]);
        } else if (dec.type === 'painting') {
          mesh = AssetFactory.createPainting(dec.size ? dec.size[0] : 1.5, dec.size ? dec.size[1] : 1.2);
          mesh.position.set(dec.pos[0], dec.pos[1] || 3, dec.pos[2]);
          if (dec.rotation) mesh.rotation.y = dec.rotation;
        } else if (dec.type === 'sconce') {
          mesh = AssetFactory.createWallSconce();
          mesh.position.set(dec.pos[0], dec.pos[1] || 3, dec.pos[2]);
          if (dec.rotation) mesh.rotation.y = dec.rotation;
        }

        if (mesh) {
          this.scene.add(mesh);
          this.meshes.push(mesh);
        }
      }
    }
  }

  getColliders() {
    return this.colliders;
  }

  clear() {
    for (const mesh of this.meshes) {
      this.scene.remove(mesh);
      mesh.traverse?.((child) => {
        if (child.isLight) child.dispose?.();
      });
    }
    this.meshes = [];
    this.colliders = [];
  }
}
