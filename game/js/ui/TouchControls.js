export class TouchControls {
  constructor() {
    this.container = document.getElementById('touch-controls');
    this.leftZone = document.getElementById('touch-left-zone');
    this.rightZone = document.getElementById('touch-right-zone');
    this.leftJoystick = document.getElementById('touch-left-joystick');
    this.rightJoystick = document.getElementById('touch-right-joystick');
    this.leftBase = document.getElementById('touch-left-base');
    this.leftThumb = document.getElementById('touch-left-thumb');
    this.rightBase = document.getElementById('touch-right-base');
    this.rightThumb = document.getElementById('touch-right-thumb');
    this.reloadBtn = document.getElementById('touch-reload-btn');
    this.pauseBtn = document.getElementById('touch-pause-btn');

    // State
    this._left = { active: false, pointerId: null, startX: 0, startY: 0, x: 0, y: 0 };
    this._right = { active: false, pointerId: null, startX: 0, startY: 0, x: 0, y: 0, shooting: false };

    // Callbacks
    this.onReload = null;
    this.onPause = null;

    this._maxRadius = 50; // max thumb offset in px

    this._setupListeners();
  }

  show() {
    this.container.classList.remove('hidden');
  }

  hide() {
    this.container.classList.add('hidden');
  }

  _setupListeners() {
    // Left joystick
    this.leftZone.addEventListener('pointerdown', (e) => this._onLeftDown(e));
    this.leftZone.addEventListener('pointermove', (e) => this._onLeftMove(e));
    this.leftZone.addEventListener('pointerup', (e) => this._onLeftUp(e));
    this.leftZone.addEventListener('pointercancel', (e) => this._onLeftUp(e));

    // Right joystick
    this.rightZone.addEventListener('pointerdown', (e) => this._onRightDown(e));
    this.rightZone.addEventListener('pointermove', (e) => this._onRightMove(e));
    this.rightZone.addEventListener('pointerup', (e) => this._onRightUp(e));
    this.rightZone.addEventListener('pointercancel', (e) => this._onRightUp(e));

    // Buttons
    this.reloadBtn.addEventListener('click', () => {
      if (this.onReload) this.onReload();
    });

    this.pauseBtn.addEventListener('click', () => {
      if (this.onPause) this.onPause();
    });
  }

  _onLeftDown(e) {
    if (this._left.active) return;
    this._left.active = true;
    this._left.pointerId = e.pointerId;
    this._left.startX = e.clientX;
    this._left.startY = e.clientY;
    this._left.x = 0;
    this._left.y = 0;

    this.leftJoystick.style.display = 'block';
    this.leftJoystick.style.left = (e.clientX - 60) + 'px';
    this.leftJoystick.style.top = (e.clientY - 60) + 'px';

    this.leftThumb.style.transform = 'translate(-50%, -50%)';
    this.leftZone.setPointerCapture(e.pointerId);
  }

  _onLeftMove(e) {
    if (!this._left.active || e.pointerId !== this._left.pointerId) return;
    const dx = e.clientX - this._left.startX;
    const dy = e.clientY - this._left.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampDist = Math.min(dist, this._maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampDist;
    const thumbY = Math.sin(angle) * clampDist;

    this.leftThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

    // Normalize to -1..1
    this._left.x = thumbX / this._maxRadius;
    this._left.y = -thumbY / this._maxRadius; // invert Y (up = positive)
  }

  _onLeftUp(e) {
    if (e.pointerId !== this._left.pointerId) return;
    this._left.active = false;
    this._left.pointerId = null;
    this._left.x = 0;
    this._left.y = 0;
    this.leftJoystick.style.display = 'none';
    this.leftThumb.style.transform = 'translate(-50%, -50%)';
  }

  _onRightDown(e) {
    if (this._right.active) return;
    this._right.active = true;
    this._right.pointerId = e.pointerId;
    this._right.startX = e.clientX;
    this._right.startY = e.clientY;
    this._right.x = 0;
    this._right.y = 0;
    this._right.shooting = true;

    this.rightJoystick.style.display = 'block';
    this.rightJoystick.style.left = (e.clientX - 60) + 'px';
    this.rightJoystick.style.top = (e.clientY - 60) + 'px';

    this.rightThumb.style.transform = 'translate(-50%, -50%)';
    this.rightZone.setPointerCapture(e.pointerId);
  }

  _onRightMove(e) {
    if (!this._right.active || e.pointerId !== this._right.pointerId) return;
    const dx = e.clientX - this._right.startX;
    const dy = e.clientY - this._right.startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clampDist = Math.min(dist, this._maxRadius);
    const angle = Math.atan2(dy, dx);

    const thumbX = Math.cos(angle) * clampDist;
    const thumbY = Math.sin(angle) * clampDist;

    this.rightThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

    this._right.x = thumbX / this._maxRadius;
    this._right.y = -thumbY / this._maxRadius;
  }

  _onRightUp(e) {
    if (e.pointerId !== this._right.pointerId) return;
    this._right.active = false;
    this._right.pointerId = null;
    this._right.x = 0;
    this._right.y = 0;
    this._right.shooting = false;
    this.rightJoystick.style.display = 'none';
    this.rightThumb.style.transform = 'translate(-50%, -50%)';
  }

  getLeftJoystick() {
    return { x: this._left.x, y: this._left.y };
  }

  getRightJoystick() {
    return { x: this._right.x, y: this._right.y };
  }

  isShooting() {
    return this._right.shooting && this._right.active;
  }
}
