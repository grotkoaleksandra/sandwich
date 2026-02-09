export class InputManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.keys = {};
    this.mouseX = 0;
    this.mouseY = 0;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    this.mouseDown = false;
    this.pointerLocked = false;
    this.isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    // Touch joystick state
    this.leftJoystick = { active: false, x: 0, y: 0, pointerId: null };
    this.rightJoystick = { active: false, x: 0, y: 0, pointerId: null, shooting: false };

    // Pending actions
    this.reloadPressed = false;
    this.pausePressed = false;

    this._setupKeyboard();
    this._setupMouse();
  }

  _setupKeyboard() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyR') this.reloadPressed = true;
      if (e.code === 'Escape') this.pausePressed = true;
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }

  _setupMouse() {
    this.canvas.addEventListener('click', () => {
      if (!this.isTouchDevice && !this.pointerLocked) {
        this.canvas.requestPointerLock();
      }
    });

    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === this.canvas;
    });

    document.addEventListener('mousemove', (e) => {
      if (this.pointerLocked) {
        this.mouseDeltaX += e.movementX;
        this.mouseDeltaY += e.movementY;
      }
    });

    document.addEventListener('mousedown', (e) => {
      if (e.button === 0) this.mouseDown = true;
    });
    document.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.mouseDown = false;
    });
  }

  setupTouchControls(touchControls) {
    this.touchControls = touchControls;
  }

  // Call once per frame to read & reset deltas
  getMouseDelta() {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { x: dx, y: dy };
  }

  // Movement vector from WASD or left joystick (normalized -1 to 1)
  getMovement() {
    if (this.isTouchDevice && this.touchControls) {
      return this.touchControls.getLeftJoystick();
    }
    let x = 0, y = 0;
    if (this.keys['KeyW'] || this.keys['ArrowUp']) y += 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) y -= 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) x -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) x += 1;
    // Normalize diagonal
    const len = Math.sqrt(x * x + y * y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  }

  isShooting() {
    if (this.isTouchDevice && this.touchControls) {
      return this.touchControls.isShooting();
    }
    return this.mouseDown && this.pointerLocked;
  }

  isSprinting() {
    return this.keys['ShiftLeft'] || this.keys['ShiftRight'];
  }

  consumeReload() {
    const v = this.reloadPressed;
    this.reloadPressed = false;
    return v;
  }

  consumePause() {
    const v = this.pausePressed;
    this.pausePressed = false;
    return v;
  }

  getAimDelta() {
    if (this.isTouchDevice && this.touchControls) {
      const aim = this.touchControls.getRightJoystick();
      return { x: aim.x * 3, y: aim.y * 3 };
    }
    return this.getMouseDelta();
  }

  releasePointerLock() {
    if (this.pointerLocked) {
      document.exitPointerLock();
    }
  }
}
