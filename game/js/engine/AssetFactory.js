import * as THREE from 'three';

// Higher-poly shared geometries for smoother look
const _boxGeo = new THREE.BoxGeometry(1, 1, 1);
const _roundBoxGeo = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2);
const _sphereGeo = new THREE.SphereGeometry(0.5, 16, 12);
const _cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
const _capsuleGeo = new THREE.CapsuleGeometry(0.5, 0.5, 4, 12);
const _bulletGeo = new THREE.SphereGeometry(0.08, 8, 6);
const _bulletTrailGeo = new THREE.CylinderGeometry(0.03, 0.06, 0.4, 6);

// Material palette — rich mansion tones
const _materials = {
  // Player — tactical dark outfit
  playerBody: new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6, metalness: 0.2 }),
  playerAccent: new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.5, metalness: 0.3 }),
  playerSkin: new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8, metalness: 0.0 }),
  playerBelt: new THREE.MeshStandardMaterial({ color: 0x554422, roughness: 0.4, metalness: 0.3 }),
  gunMetal: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2, metalness: 0.8 }),
  gunGrip: new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.7, metalness: 0.1 }),

  // Mansion
  darkWood: new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.6, metalness: 0.1 }),
  lightWood: new THREE.MeshStandardMaterial({ color: 0x6b4c3b, roughness: 0.55, metalness: 0.05 }),
  marble: new THREE.MeshStandardMaterial({ color: 0xd4cfc4, roughness: 0.25, metalness: 0.05 }),
  marbleDark: new THREE.MeshStandardMaterial({ color: 0x8a8478, roughness: 0.3, metalness: 0.1 }),
  wallpaper: new THREE.MeshStandardMaterial({ color: 0x6b5b4e, roughness: 0.85, metalness: 0.0 }),
  wallpaperDark: new THREE.MeshStandardMaterial({ color: 0x4a3a2e, roughness: 0.9, metalness: 0.0 }),
  velvet: new THREE.MeshStandardMaterial({ color: 0x8b1a1a, roughness: 0.9, metalness: 0.0 }),
  gold: new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.25, metalness: 0.9 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xb8860b, roughness: 0.3, metalness: 0.85 }),
  iron: new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.4, metalness: 0.7 }),
  carpet: new THREE.MeshStandardMaterial({ color: 0x6b2d3e, roughness: 0.95, metalness: 0.0 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x88aacc, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.3 }),
};

export class AssetFactory {
  static createPlayer() {
    const group = new THREE.Group();

    // Torso — tactical vest look
    const torso = new THREE.Mesh(_roundBoxGeo, _materials.playerBody);
    torso.scale.set(0.9, 1.3, 0.55);
    torso.position.y = 1.55;
    torso.castShadow = true;
    group.add(torso);

    // Vest detail — front plate
    const vest = new THREE.Mesh(_boxGeo, _materials.playerAccent);
    vest.scale.set(0.7, 0.6, 0.1);
    vest.position.set(0, 1.65, 0.28);
    vest.castShadow = true;
    group.add(vest);

    // Belt
    const belt = new THREE.Mesh(_boxGeo, _materials.playerBelt);
    belt.scale.set(0.95, 0.15, 0.6);
    belt.position.y = 0.95;
    belt.castShadow = true;
    group.add(belt);

    // Head
    const head = new THREE.Mesh(_sphereGeo, _materials.playerSkin);
    head.scale.set(0.6, 0.65, 0.6);
    head.position.y = 2.55;
    head.castShadow = true;
    group.add(head);

    // Helmet/cap
    const helmet = new THREE.Mesh(_sphereGeo, _materials.playerBody);
    helmet.scale.set(0.63, 0.35, 0.63);
    helmet.position.y = 2.75;
    helmet.castShadow = true;
    group.add(helmet);

    // Left arm (upper)
    const leftArm = new THREE.Mesh(_capsuleGeo, _materials.playerBody);
    leftArm.scale.set(0.18, 0.35, 0.18);
    leftArm.position.set(-0.6, 1.5, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    // Right arm (holding gun, forward)
    const rightArm = new THREE.Mesh(_capsuleGeo, _materials.playerBody);
    rightArm.scale.set(0.18, 0.35, 0.18);
    rightArm.position.set(0.5, 1.5, 0.2);
    rightArm.rotation.x = -0.4;
    rightArm.castShadow = true;
    group.add(rightArm);

    // Left leg
    const leftLeg = new THREE.Mesh(_capsuleGeo, _materials.playerAccent);
    leftLeg.scale.set(0.17, 0.35, 0.17);
    leftLeg.position.set(-0.22, 0.42, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    // Right leg
    const rightLeg = new THREE.Mesh(_capsuleGeo, _materials.playerAccent);
    rightLeg.scale.set(0.17, 0.35, 0.17);
    rightLeg.position.set(0.22, 0.42, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Gun — more detailed
    const gunBody = new THREE.Mesh(_boxGeo, _materials.gunMetal);
    gunBody.scale.set(0.08, 0.1, 0.55);
    gunBody.position.set(0.5, 1.55, 0.55);
    gunBody.castShadow = true;
    group.add(gunBody);

    // Gun barrel
    const barrel = new THREE.Mesh(_cylinderGeo, _materials.gunMetal);
    barrel.scale.set(0.06, 0.25, 0.06);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(0.5, 1.57, 0.9);
    barrel.castShadow = true;
    group.add(barrel);

    // Gun grip
    const grip = new THREE.Mesh(_boxGeo, _materials.gunGrip);
    grip.scale.set(0.06, 0.14, 0.08);
    grip.position.set(0.5, 1.42, 0.45);
    grip.rotation.x = 0.2;
    group.add(grip);

    // Gun tip marker
    const gunTip = new THREE.Object3D();
    gunTip.position.set(0.5, 1.57, 1.05);
    gunTip.name = 'gunTip';
    group.add(gunTip);

    return group;
  }

  static createEnemy(color = 0xff4444, scale = 1.0) {
    const group = new THREE.Group();

    // Dark suit body
    const bodyColor = new THREE.Color(color).multiplyScalar(0.6);
    const accentColor = new THREE.Color(color);

    const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.7, metalness: 0.1 });
    const accentMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.5, metalness: 0.2 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xbbaa88, roughness: 0.8, metalness: 0.0 });

    // Torso
    const torso = new THREE.Mesh(_roundBoxGeo, bodyMat);
    torso.scale.set(0.85 * scale, 1.2 * scale, 0.5 * scale);
    torso.position.y = 1.45 * scale;
    torso.castShadow = true;
    torso.name = 'torso';
    group.add(torso);

    // Accent stripe on torso
    const stripe = new THREE.Mesh(_boxGeo, accentMat);
    stripe.scale.set(0.15 * scale, 1.0 * scale, 0.52 * scale);
    stripe.position.y = 1.45 * scale;
    stripe.castShadow = true;
    group.add(stripe);

    // Head
    const head = new THREE.Mesh(_sphereGeo, skinMat);
    head.scale.set(0.55 * scale, 0.58 * scale, 0.55 * scale);
    head.position.y = 2.35 * scale;
    head.castShadow = true;
    group.add(head);

    // Eye glow — menacing
    const eyeMat = new THREE.MeshStandardMaterial({
      color: accentColor,
      emissive: accentColor,
      emissiveIntensity: 1.5,
    });
    for (const side of [-1, 1]) {
      const eye = new THREE.Mesh(_sphereGeo, eyeMat);
      eye.scale.set(0.06 * scale, 0.06 * scale, 0.06 * scale);
      eye.position.set(side * 0.12 * scale, 2.4 * scale, 0.22 * scale);
      group.add(eye);
    }

    // Arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(_capsuleGeo, bodyMat);
      arm.scale.set(0.14 * scale, 0.32 * scale, 0.14 * scale);
      arm.position.set(side * 0.55 * scale, 1.35 * scale, 0);
      arm.castShadow = true;
      group.add(arm);
    }

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: bodyColor.clone().multiplyScalar(0.8), roughness: 0.7, metalness: 0.1 });
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(_capsuleGeo, legMat);
      leg.scale.set(0.15 * scale, 0.32 * scale, 0.15 * scale);
      leg.position.set(side * 0.2 * scale, 0.38 * scale, 0);
      leg.castShadow = true;
      group.add(leg);
    }

    // Gun tip marker
    const gunTip = new THREE.Object3D();
    gunTip.position.set(0.55 * scale, 1.4 * scale, 0.5 * scale);
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
    const color = isEnemy ? 0xff3333 : 0xffdd44;
    const group = new THREE.Group();

    // Bullet head
    const head = new THREE.Mesh(
      _bulletGeo,
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 3,
      })
    );
    group.add(head);

    // Bullet trail
    const trail = new THREE.Mesh(
      _bulletTrailGeo,
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.4,
      })
    );
    trail.rotation.x = Math.PI / 2;
    trail.position.z = -0.2;
    group.add(trail);

    group.castShadow = false;
    return group;
  }

  static createFloor(width, depth, color = 0x3d2b1f) {
    // Rich wooden floor with darker tone
    const geo = new THREE.PlaneGeometry(width, depth, 1, 1);
    const mat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.55,
      metalness: 0.05,
    });
    const floor = new THREE.Mesh(geo, mat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    return floor;
  }

  static createFloorGrid(width, depth) {
    // Subtle wood plank lines instead of sci-fi grid
    const size = Math.max(width, depth);
    const divisions = Math.floor(size / 1.5);
    const grid = new THREE.GridHelper(size, divisions, 0x2a1f14, 0x2a1f14);
    grid.position.y = 0.01;
    grid.material.opacity = 0.15;
    grid.material.transparent = true;
    return grid;
  }

  static createWall(width, height, depth, color = 0x4a3a2e) {
    const mesh = new THREE.Mesh(
      _boxGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.0 })
    );
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createObstacle(width, height, depth, color = 0x556677) {
    const mesh = new THREE.Mesh(
      _roundBoxGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 })
    );
    mesh.scale.set(width, height, depth);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  static createCylinder(radius, height, color = 0x667788) {
    const mesh = new THREE.Mesh(
      _cylinderGeo,
      new THREE.MeshStandardMaterial({ color, roughness: 0.35, metalness: 0.15 })
    );
    mesh.scale.set(radius * 2, height, radius * 2);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  // === MANSION-SPECIFIC BUILDERS ===

  static createPillar(height = 4, radius = 0.4) {
    const group = new THREE.Group();

    // Main column
    const col = new THREE.Mesh(_cylinderGeo, _materials.marble);
    col.scale.set(radius * 2, height, radius * 2);
    col.position.y = height / 2;
    col.castShadow = true;
    col.receiveShadow = true;
    group.add(col);

    // Base
    const base = new THREE.Mesh(_boxGeo, _materials.marbleDark);
    base.scale.set(radius * 3, 0.3, radius * 3);
    base.position.y = 0.15;
    base.castShadow = true;
    group.add(base);

    // Capital
    const cap = new THREE.Mesh(_boxGeo, _materials.marbleDark);
    cap.scale.set(radius * 3, 0.25, radius * 3);
    cap.position.y = height - 0.125;
    cap.castShadow = true;
    group.add(cap);

    return group;
  }

  static createTable(width = 2, depth = 1) {
    const group = new THREE.Group();

    // Tabletop
    const top = new THREE.Mesh(_roundBoxGeo, _materials.darkWood);
    top.scale.set(width, 0.12, depth);
    top.position.y = 0.9;
    top.castShadow = true;
    top.receiveShadow = true;
    group.add(top);

    // Legs
    for (const [lx, lz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const leg = new THREE.Mesh(_boxGeo, _materials.darkWood);
      leg.scale.set(0.08, 0.85, 0.08);
      leg.position.set(lx * (width / 2 - 0.1), 0.425, lz * (depth / 2 - 0.1));
      leg.castShadow = true;
      group.add(leg);
    }

    return group;
  }

  static createBookshelf(width = 2, height = 3.5) {
    const group = new THREE.Group();

    // Back panel
    const back = new THREE.Mesh(_boxGeo, _materials.darkWood);
    back.scale.set(width, height, 0.1);
    back.position.set(0, height / 2, -0.2);
    back.castShadow = true;
    back.receiveShadow = true;
    group.add(back);

    // Shelves
    const shelfCount = 4;
    for (let i = 0; i <= shelfCount; i++) {
      const shelf = new THREE.Mesh(_boxGeo, _materials.lightWood);
      shelf.scale.set(width, 0.06, 0.4);
      shelf.position.set(0, (i / shelfCount) * (height - 0.1) + 0.05, 0);
      shelf.castShadow = true;
      group.add(shelf);
    }

    // Side panels
    for (const side of [-1, 1]) {
      const panel = new THREE.Mesh(_boxGeo, _materials.darkWood);
      panel.scale.set(0.06, height, 0.4);
      panel.position.set(side * (width / 2), height / 2, 0);
      panel.castShadow = true;
      group.add(panel);
    }

    // Books (colorful rectangles on shelves)
    const bookColors = [0x8b1a1a, 0x1a3a5c, 0x2d5a27, 0x5c3a1a, 0x3a1a5c, 0x6b4c3b];
    for (let s = 1; s <= shelfCount; s++) {
      const shelfY = (s / shelfCount) * (height - 0.1) + 0.08;
      let bx = -width / 2 + 0.15;
      while (bx < width / 2 - 0.15) {
        const bw = 0.06 + Math.random() * 0.08;
        const bh = 0.25 + Math.random() * 0.15;
        const bc = bookColors[Math.floor(Math.random() * bookColors.length)];
        const book = new THREE.Mesh(_boxGeo,
          new THREE.MeshStandardMaterial({ color: bc, roughness: 0.8 })
        );
        book.scale.set(bw, bh, 0.22);
        book.position.set(bx + bw / 2, shelfY + bh / 2, 0);
        group.add(book);
        bx += bw + 0.01;
      }
    }

    return group;
  }

  static createChandelier(radius = 1.5) {
    const group = new THREE.Group();

    // Chain
    const chain = new THREE.Mesh(_cylinderGeo, _materials.brass);
    chain.scale.set(0.04, 1.5, 0.04);
    chain.position.y = 0.75;
    group.add(chain);

    // Ring
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, 0.06, 8, 24),
      _materials.gold
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Light bulbs
    const lightCount = 6;
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const bulb = new THREE.Mesh(
        _sphereGeo,
        new THREE.MeshStandardMaterial({
          color: 0xffeedd,
          emissive: 0xffcc88,
          emissiveIntensity: 2,
        })
      );
      bulb.scale.set(0.1, 0.12, 0.1);
      bulb.position.set(x, -0.1, z);
      group.add(bulb);
    }

    // Actual point light
    const light = new THREE.PointLight(0xffcc88, 1.2, 20, 1.5);
    light.position.y = -0.2;
    light.castShadow = false; // performance
    group.add(light);

    return group;
  }

  static createCarpet(width, depth) {
    const geo = new THREE.PlaneGeometry(width, depth);
    const carpet = new THREE.Mesh(geo, _materials.carpet);
    carpet.rotation.x = -Math.PI / 2;
    carpet.position.y = 0.02;
    carpet.receiveShadow = true;

    // Gold border
    const borderGeo = new THREE.PlaneGeometry(width + 0.3, depth + 0.3);
    const border = new THREE.Mesh(borderGeo,
      new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.7 })
    );
    border.rotation.x = -Math.PI / 2;
    border.position.y = 0.015;
    border.receiveShadow = true;

    const group = new THREE.Group();
    group.add(border);
    group.add(carpet);
    return group;
  }

  static createPainting(width = 1.5, height = 1.2) {
    const group = new THREE.Group();

    // Frame
    const frame = new THREE.Mesh(_boxGeo, _materials.gold);
    frame.scale.set(width + 0.15, height + 0.15, 0.06);
    frame.castShadow = true;
    group.add(frame);

    // Canvas — dark moody painting
    const paintColors = [0x2a1a0a, 0x1a2a0a, 0x0a1a2a, 0x2a0a1a, 0x1a1a2a];
    const canvas = new THREE.Mesh(_boxGeo,
      new THREE.MeshStandardMaterial({
        color: paintColors[Math.floor(Math.random() * paintColors.length)],
        roughness: 0.9,
      })
    );
    canvas.scale.set(width, height, 0.03);
    canvas.position.z = 0.02;
    group.add(canvas);

    return group;
  }

  static createWallSconce() {
    const group = new THREE.Group();

    // Bracket
    const bracket = new THREE.Mesh(_boxGeo, _materials.brass);
    bracket.scale.set(0.08, 0.15, 0.15);
    bracket.position.z = 0.08;
    group.add(bracket);

    // Arm
    const arm = new THREE.Mesh(_cylinderGeo, _materials.brass);
    arm.scale.set(0.04, 0.2, 0.04);
    arm.rotation.x = Math.PI / 2;
    arm.position.set(0, 0.05, 0.2);
    group.add(arm);

    // Flame bulb
    const flame = new THREE.Mesh(
      _sphereGeo,
      new THREE.MeshStandardMaterial({
        color: 0xffddaa,
        emissive: 0xffaa55,
        emissiveIntensity: 2.5,
      })
    );
    flame.scale.set(0.08, 0.12, 0.08);
    flame.position.set(0, 0.12, 0.3);
    group.add(flame);

    // Point light
    const light = new THREE.PointLight(0xffaa55, 0.6, 10, 2);
    light.position.set(0, 0.12, 0.3);
    group.add(light);

    return group;
  }

  static createMuzzleFlash() {
    const mesh = new THREE.Mesh(
      _sphereGeo,
      new THREE.MeshBasicMaterial({ color: 0xffdd44, transparent: true, opacity: 0.8 })
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
    emissiveIntensity: 1.5,
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
