import * as THREE from 'three';
import { AssetFactory } from '../engine/AssetFactory.js';

export class Arena {
  constructor(scene) {
    this.scene = scene;
    this.meshes = [];
    this.colliders = []; // {position, halfWidth, halfDepth, height}
  }

  build(levelData) {
    this.clear();

    const { width, depth } = levelData.arenaSize;
    const floorColor = levelData.floorColor;
    const obsColor = levelData.obstacleColor;
    const wallHeight = 5;
    const wallThick = 1;

    // Floor
    const floor = AssetFactory.createFloor(width, depth, floorColor);
    this.scene.add(floor);
    this.meshes.push(floor);

    // Grid
    const grid = AssetFactory.createFloorGrid(width, depth);
    this.scene.add(grid);
    this.meshes.push(grid);

    // Walls (boundaries)
    const halfW = width / 2;
    const halfD = depth / 2;

    const walls = [
      { pos: [0, wallHeight / 2, halfD + wallThick / 2], size: [width + wallThick * 2, wallHeight, wallThick] },
      { pos: [0, wallHeight / 2, -halfD - wallThick / 2], size: [width + wallThick * 2, wallHeight, wallThick] },
      { pos: [halfW + wallThick / 2, wallHeight / 2, 0], size: [wallThick, wallHeight, depth] },
      { pos: [-halfW - wallThick / 2, wallHeight / 2, 0], size: [wallThick, wallHeight, depth] },
    ];

    for (const w of walls) {
      const wall = AssetFactory.createWall(w.size[0], w.size[1], w.size[2], 0x333355);
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

    // Obstacles
    for (const obs of levelData.obstacles) {
      let mesh;
      let hw, hd, h;

      if (obs.type === 'box') {
        mesh = AssetFactory.createObstacle(obs.size[0], obs.size[1], obs.size[2], obsColor);
        mesh.position.set(obs.pos[0], obs.size[1] / 2, obs.pos[2]);
        hw = obs.size[0] / 2;
        hd = obs.size[2] / 2;
        h = obs.size[1];
      } else if (obs.type === 'cylinder') {
        mesh = AssetFactory.createCylinder(obs.size[0], obs.size[1], obsColor);
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
  }

  getColliders() {
    return this.colliders;
  }

  clear() {
    for (const mesh of this.meshes) {
      this.scene.remove(mesh);
    }
    this.meshes = [];
    this.colliders = [];
  }
}
