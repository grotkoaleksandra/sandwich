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
    this.renderer.toneMappingExposure = 1.1;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0808);
    this.scene.fog = new THREE.FogExp2(0x0a0808, 0.012);

    // Camera — tight over-the-shoulder
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(2, 4, -8);

    // Camera follow state — over right shoulder
    this.cameraOffset = new THREE.Vector3(2.5, 3.5, -7);
    this.cameraTarget = new THREE.Vector3();
    this.cameraLookTarget = new THREE.Vector3();
    this.cameraYaw = 0;
    this.cameraPitch = 0.2;

    // Lighting
    this._setupLighting();

    // Resize handler
    window.addEventListener('resize', () => this._onResize());
  }

  _setupLighting() {
    // Warm ambient — dim mansion interior
    const ambient = new THREE.AmbientLight(0xffeedd, 0.25);
    this.scene.add(ambient);

    // Main directional — moonlight through windows
    this.dirLight = new THREE.DirectionalLight(0xccddff, 0.6);
    this.dirLight.position.set(10, 20, 8);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 80;
    this.dirLight.shadow.camera.left = -35;
    this.dirLight.shadow.camera.right = 35;
    this.dirLight.shadow.camera.top = 35;
    this.dirLight.shadow.camera.bottom = -35;
    this.dirLight.shadow.bias = -0.001;
    this.scene.add(this.dirLight);

    // Warm hemisphere — floor bounce
    const hemi = new THREE.HemisphereLight(0x554433, 0x221100, 0.35);
    this.scene.add(hemi);
  }

  updateCamera(playerPosition, deltaTime) {
    if (!playerPosition) return;

    // Over-the-shoulder: offset to the right and closer
    const distance = 7;
    const shoulderOffsetX = 2.2; // shift right

    const behindX = -Math.sin(this.cameraYaw) * distance;
    const behindZ = Math.cos(this.cameraYaw) * distance;
    const rightX = Math.cos(this.cameraYaw) * shoulderOffsetX;
    const rightZ = Math.sin(this.cameraYaw) * shoulderOffsetX;
    const offsetY = 3.0 + distance * Math.sin(this.cameraPitch) * 0.4;

    // Target camera position
    this.cameraTarget.set(
      playerPosition.x + behindX + rightX,
      playerPosition.y + offsetY,
      playerPosition.z + behindZ + rightZ
    );

    // Smooth follow
    const lerpFactor = 1 - Math.pow(0.0005, deltaTime);
    this.camera.position.lerp(this.cameraTarget, lerpFactor);

    // Look ahead of player (in camera forward direction), slightly above shoulder
    const lookAheadDist = 8;
    this.cameraLookTarget.set(
      playerPosition.x + Math.sin(this.cameraYaw) * lookAheadDist,
      playerPosition.y + 2.0,
      playerPosition.z - Math.cos(this.cameraYaw) * lookAheadDist
    );
    this.camera.lookAt(this.cameraLookTarget);

    // Move shadow camera with player
    this.dirLight.position.set(
      playerPosition.x + 10,
      20,
      playerPosition.z + 8
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
