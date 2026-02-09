import * as THREE from 'three';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e);
    this.scene.fog = new THREE.FogExp2(0x1a1a2e, 0.015);

    // Camera — third person
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 8, -12);

    // Camera follow state
    this.cameraOffset = new THREE.Vector3(0, 8, -12);
    this.cameraTarget = new THREE.Vector3();
    this.cameraLookTarget = new THREE.Vector3();
    this.cameraYaw = 0; // horizontal orbit angle
    this.cameraPitch = 0.3; // vertical tilt (radians, clamped)

    // Lighting
    this._setupLighting();

    // Resize handler
    window.addEventListener('resize', () => this._onResize());
  }

  _setupLighting() {
    // Ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambient);

    // Main directional light with shadows
    this.dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    this.dirLight.position.set(15, 25, 10);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    this.dirLight.shadow.camera.left = -30;
    this.dirLight.shadow.camera.right = 30;
    this.dirLight.shadow.camera.top = 30;
    this.dirLight.shadow.camera.bottom = -30;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // Hemisphere light for color variation
    const hemi = new THREE.HemisphereLight(0x4488ff, 0x332211, 0.3);
    this.scene.add(hemi);
  }

  updateCamera(playerPosition, deltaTime) {
    if (!playerPosition) return;

    // Calculate camera position based on yaw/pitch orbit
    const distance = 14;
    const offsetX = Math.sin(this.cameraYaw) * distance * Math.cos(this.cameraPitch);
    const offsetZ = -Math.cos(this.cameraYaw) * distance * Math.cos(this.cameraPitch);
    const offsetY = 5 + distance * Math.sin(this.cameraPitch);

    // Target position
    this.cameraTarget.set(
      playerPosition.x + offsetX,
      playerPosition.y + offsetY,
      playerPosition.z + offsetZ
    );

    // Smooth follow
    const lerpFactor = 1 - Math.pow(0.001, deltaTime);
    this.camera.position.lerp(this.cameraTarget, lerpFactor);

    // Look at point slightly above player
    this.cameraLookTarget.set(
      playerPosition.x,
      playerPosition.y + 2,
      playerPosition.z
    );
    this.camera.lookAt(this.cameraLookTarget);

    // Move shadow camera with player
    this.dirLight.position.set(
      playerPosition.x + 15,
      25,
      playerPosition.z + 10
    );
    this.dirLight.target.position.copy(playerPosition);
    this.dirLight.target.updateMatrixWorld();
  }

  setSceneColors(skyColor, fogColor) {
    this.scene.background.setHex(skyColor);
    this.scene.fog.color.setHex(fogColor || skyColor);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  }

  // Get direction camera is facing projected onto XZ plane
  getCameraForward() {
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();
    return dir;
  }

  getCameraRight() {
    const forward = this.getCameraForward();
    return new THREE.Vector3(-forward.z, 0, forward.x);
  }
}
