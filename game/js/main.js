import { GameEngine } from './engine/GameEngine.js';

const canvas = document.getElementById('game-canvas');
const engine = new GameEngine(canvas);
engine.init();
