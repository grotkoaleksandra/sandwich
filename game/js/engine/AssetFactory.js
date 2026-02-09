import * as THREE from 'three';

// Shared geometries to minimize draw overhead
const _boxGeo = new THREE.BoxGeometry(1, 1, 1);
const _sphereGeo = new THREE.SphereGeometry(0.5, 12, 8);
const _cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
const _bulletGeo = new THREE.SphereGeometry(0.1, 6, 4);

export class AssetFactory {
  static createPlayer() {
    const group = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x4488ff })
    );
    torso.scale.set(1, 1.4, 0.6);
    torso.position.y = 1.5;
    torso.castShadow = true;
    group.add(torso);

    // Head
    const head = new THREE.Mesh(
      _sphereGeo,
      new THREE.MeshStandardMaterial({ color: 0x66aaff })
    );
    head.scale.set(0.7, 0.7, 0.7);
    head.position.y = 2.6;
    head.castShadow = true;
    group.add(head);

    // Left arm
    const leftArm = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x3377dd })
    );
    leftArm.scale.set(0.25, 0.9, 0.25);
    leftArm.position.set(-0.7, 1.4, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    // Right arm
    const rightArm = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x3377dd })
    );
    rightArm.scale.set(0.25, 0.9, 0.25);
    rightArm.position.set(0.7, 1.4, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Left leg
    const leftLeg = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x2255aa })
    );
    leftLeg.scale.set(0.3, 0.8, 0.3);
    leftLeg.position.set(-0.25, 0.4, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x2255aa })
    );
    rightLeg.scale.set(0.3, 0.8, 0.3);
    rightLeg.position.set(0.25, 0.4, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Gun
    const gun = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color: 0x333333 })
    );
    gun.scale.set(0.12, 0.12, 0.7);
    gun.position.set(0.7, 1.5, 0.45);
    gun.castShadow = true;
    group.add(gun);

    // Gun tip marker (invisible, used for bullet spawn)
    const gunTip = new THREE.Object3D();
    gunTip.position.set(0.7, 1.5, 0.8);
    gunTip.name = 'gunTip';
    group.add(gunTip);

    return group;
  }

  static createEnemy(color = 0xff4444, scale = 1.0) {
    const group = new THREE.Group();

    // Torso
    const torso = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color })
    );
    torso.scale.set(0.9 * scale, 1.3 * scale, 0.5 * scale);
    torso.position.y = 1.4 * scale;
    torso.castShadow = true;
    torso.name = 'torso';
    group.add(torso);

    // Head
    const headColor = new THREE.Color(color).multiplyScalar(1.2);
    const head = new THREE.Mesh(
      _sphereGeo,
      new THREE.MeshStandardMaterial({ color: headColor })
    );
    head.scale.set(0.6 * scale, 0.6 * scale, 0.6 * scale);
    head.position.y = 2.4 * scale;
    head.castShadow = true;
    group.add(head);

    // Arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        _boxGeo,
        new THREE.MeshStandardMaterial({ color })
      );
      arm.scale.set(0.22 * scale, 0.8 * scale, 0.22 * scale);
      arm.position.set(side * 0.65 * scale, 1.3 * scale, 0);
      arm.castShadow = true;
      group.add(arm);
    }

    // Legs
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        _boxGeo,
        new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.7) })
      );
      leg.scale.set(0.25 * scale, 0.7 * scale, 0.25 * scale);
      leg.position.set(side * 0.22 * scale, 0.35 * scale, 0);
      leg.castShadow = true;
      group.add(leg);
    }

    // Gun tip marker
    const gunTip = new THREE.Object3D();
    gunTip.position.set(0.65 * scale, 1.4 * scale, 0.5 * scale);
    gunTip.name = 'gunTip';
    group.add(gunTip);

    // Store original materials for flash effect
    group.userData.originalMaterials = [];
    group.traverse((child) => {
      if (child.isMesh) {
        group.userData.originalMaterials.push({ mesh: child, material: child.material });
      }
    });

    return group;
  }

  static createBullet(isEnemy = false) {
    const color = isEnemy ? 0xff4444 : 0xffff44;
    const mesh = new THREE.Mesh(
      _bulletGeo,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 2,
      })
    );
    mesh.castShadow = false;
    return mesh;
  }

  static createFloor(width, depth, color = 0x3a3a5c) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.9,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    return floor;
  }

  static createFloorGrid(width, depth) {
    const size = Math.max(width, depth);
    const divisions = Math.floor(size / 2);
    const grid = new THREE.GridHelper(size, divisions, 0x555577, 0x333355);
    grid.position.y = 0.01;
    grid.material.opacity = 0.3;
    grid.material.transparent = true;
    return grid;
  }

  static createWall(width, height, depth, color = 0x444466) {
    const mesh = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.8 })
    );
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createObstacle(width, height, depth, color = 0x556677) {
    const mesh = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
    );
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createCylinder(radius, height, color = 0x667788) {
    const mesh = new THREE.Mesh(
      _cylinderGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 })
    );
    mesh.scale.set(radius * 2, height, radius * 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createMuzzleFlash() {
    const mesh = new THREE.Mesh(
      _sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xffff44, transparent: true, opacity: 0.8 })
    );
    mesh.scale.set(0.3, 0.3, 0.3);
    return mesh;
  }

  static createDeathParticle() {
    const mesh = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0xffffff,
        emissiveIntensity: 0.5,
      })
    );
    mesh.scale.set(0.15, 0.15, 0.15);
    return mesh;
  }

  // White material for hit flash
  static _flashMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 1,
  });

  static flashEnemy(group) {
    group.traverse((child) => {
      if (child.isMesh) {
        child.material = AssetFactory._flashMaterial;
      }
    });
  }

  static unflashEnemy(group) {
    const originals = group.userData.originalMaterials;
    if (originals) {
      originals.forEach(({ mesh, material }) => {
        mesh.material = material;
      });
    }
  }
}
