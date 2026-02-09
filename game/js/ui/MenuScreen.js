export class MenuScreen {
  constructor() {
    this.menuScreen = document.getElementById('menu-screen');
    this.pauseScreen = document.getElementById('pause-screen');
    this.levelCompleteScreen = document.getElementById('level-complete-screen');
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.victoryScreen = document.getElementById('victory-screen');

    this.levelStats = document.getElementById('level-stats');
    this.gameOverStats = document.getElementById('game-over-stats');
    this.victoryStats = document.getElementById('victory-stats');
    this.levelCompleteTitle = document.getElementById('level-complete-title');

    // Callbacks
    this.onStart = null;
    this.onResume = null;
    this.onQuit = null;
    this.onNextLevel = null;
    this.onRetry = null;

    this._setupButtons();
  }

  _setupButtons() {
    document.getElementById('menu-start-btn').addEventListener('click', () => {
      if (this.onStart) this.onStart();
    });

    document.getElementById('pause-resume-btn').addEventListener('click', () => {
      if (this.onResume) this.onResume();
    });

    document.getElementById('pause-quit-btn').addEventListener('click', () => {
      if (this.onQuit) this.onQuit();
    });

    document.getElementById('next-level-btn').addEventListener('click', () => {
      if (this.onNextLevel) this.onNextLevel();
    });

    document.getElementById('retry-btn').addEventListener('click', () => {
      if (this.onRetry) this.onRetry();
    });

    document.getElementById('game-over-quit-btn').addEventListener('click', () => {
      if (this.onQuit) this.onQuit();
    });

    document.getElementById('victory-menu-btn').addEventListener('click', () => {
      if (this.onQuit) this.onQuit();
    });
  }

  showMenu() {
    this._hideAll();
    this.menuScreen.classList.remove('hidden');
  }

  hideMenu() {
    this.menuScreen.classList.add('hidden');
  }

  showPause() {
    this.pauseScreen.classList.remove('hidden');
  }

  hidePause() {
    this.pauseScreen.classList.add('hidden');
  }

  showLevelComplete(stats) {
    this._hideAll();
    const time = Math.floor(stats.time);
    const accuracy = stats.shotsFired > 0
      ? Math.round((stats.shotsHit / stats.shotsFired) * 100)
      : 0;
    this.levelStats.innerHTML = `
      Enemies Defeated: ${stats.killed}<br>
      Time: ${time}s<br>
      Accuracy: ${accuracy}%
    `;
    this.levelCompleteTitle.textContent = `LEVEL ${stats.level} COMPLETE`;
    this.levelCompleteScreen.classList.remove('hidden');
  }

  showGameOver(stats) {
    this._hideAll();
    this.gameOverStats.innerHTML = `
      Level: ${stats.level} — ${stats.name}<br>
      Enemies Defeated: ${stats.killed} / ${stats.total}
    `;
    this.gameOverScreen.classList.remove('hidden');
  }

  showVictory(stats) {
    this._hideAll();
    this.victoryStats.innerHTML = `
      All ${stats.totalLevels} levels cleared!<br>
      Total Enemies Defeated: ${stats.totalKilled}
    `;
    this.victoryScreen.classList.remove('hidden');
  }

  _hideAll() {
    this.menuScreen.classList.add('hidden');
    this.pauseScreen.classList.add('hidden');
    this.levelCompleteScreen.classList.add('hidden');
    this.gameOverScreen.classList.add('hidden');
    this.victoryScreen.classList.add('hidden');
  }

  hideAll() {
    this._hideAll();
  }
}
