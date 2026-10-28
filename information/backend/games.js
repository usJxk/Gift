/* =========================================================
   games.js — Motores de Juegos (Topos, Planetas, Casino)
   ========================================================= */
(function () {
  'use strict';

  const CONFIG_FLOWERS = {
    initialTouches: 20, targetFlowers: 10, maxLives: 3, spawnRate: 800, flowerChance: 0.7
  };

  let stateFlowers = {
    isPlaying: false, touchesLeft: CONFIG_FLOWERS.initialTouches, flowers: 0, lives: CONFIG_FLOWERS.maxLives, spawnInterval: null, activeHole: null
  };

  let statePlanets = {
    isPlaying: false, found: 0, target: 5, currentPlanet: null, options: []
  };

  const planetsData = [
    { name: "Marte", emoji: "🔴", desc: "El planeta rojo." },
    { name: "Júpiter", emoji: "🟠", desc: "El gigante gaseoso." },
    { name: "Saturno", emoji: "🪐", desc: "El de los anillos." },
    { name: "Tierra", emoji: "🌍", desc: "Nuestro hogar." },
    { name: "Neptuno", emoji: "🔵", desc: "El planeta azul." }
  ];

  let stateCasino = {
    isPlaying: false, coins: 10
  };

  const containerTopos = document.getElementById('mini-game-container');
  const holes = document.querySelectorAll('.mg-hole');
  const uiScore = document.getElementById('mg-score');
  const uiTouches = document.getElementById('mg-touches');
  const uiLives = document.getElementById('mg-lives');
  const resultScreenTopos = document.getElementById('mg-result');
  const resultTitleTopos = document.getElementById('mg-result-title');
  const resultTextTopos = document.getElementById('mg-result-text');
  const restartBtnTopos = document.getElementById('mg-restart');
  const exitBtnTopos = document.getElementById('mg-exit');

  // ==========================================
  // JUEGO 1: TOPOS
  // ==========================================
  function updateUITopos() {
    if (!uiScore) return;
    uiScore.textContent = stateFlowers.flowers;
    uiTouches.textContent = stateFlowers.touchesLeft;
    uiLives.textContent = '❤️'.repeat(stateFlowers.lives) + '🖤'.repeat(CONFIG_FLOWERS.maxLives - stateFlowers.lives);
  }

  function startTopos() {
    stateFlowers.isPlaying = true;
    stateFlowers.touchesLeft = CONFIG_FLOWERS.initialTouches;
    stateFlowers.flowers = 0;
    stateFlowers.lives = CONFIG_FLOWERS.maxLives;

    holes.forEach(h => {
      h.classList.remove('active', 'hit');
      h.querySelector('.mg-character').textContent = '';
      h.style.backgroundColor = '';
    });

    if (resultScreenTopos) resultScreenTopos.classList.add('hidden');
    if (containerTopos) containerTopos.classList.remove('hidden');
    updateUITopos();

    clearInterval(stateFlowers.spawnInterval);
    stateFlowers.spawnInterval = setInterval(spawnCharacter, CONFIG_FLOWERS.spawnRate);
  }

  function spawnCharacter() {
    if (!stateFlowers.isPlaying) return;
    if (stateFlowers.activeHole) stateFlowers.activeHole.classList.remove('active');

    const randomHole = holes[Math.floor(Math.random() * holes.length)];
    const character = randomHole.querySelector('.mg-character');
    const isFlower = Math.random() < CONFIG_FLOWERS.flowerChance;

    character.textContent = isFlower ? '🌸' : '🐱';
    randomHole.dataset.type = isFlower ? 'flower' : 'cat';

    randomHole.classList.remove('hit');
    randomHole.classList.add('active');
    stateFlowers.activeHole = randomHole;

    setTimeout(() => {
      if (randomHole.classList.contains('active') && !randomHole.classList.contains('hit')) {
        randomHole.classList.remove('active');
        if (stateFlowers.activeHole === randomHole) stateFlowers.activeHole = null;
      }
    }, CONFIG_FLOWERS.spawnRate - 100);
  }

  function handleHitTopos(e) {
    if (!stateFlowers.isPlaying) return;
    const hole = e.currentTarget;
    if (!hole.classList.contains('active') || hole.classList.contains('hit')) return;

    const type = hole.dataset.type;
    hole.classList.add('hit');
    hole.classList.remove('active');

    if (type === 'flower') {
      stateFlowers.flowers++;
      hole.style.backgroundColor = 'rgba(209, 91, 106, 0.3)';
    } else if (type === 'cat') {
      stateFlowers.lives--;
      stateFlowers.flowers = 0;
      stateFlowers.touchesLeft = Math.max(0, stateFlowers.touchesLeft - 3);
      hole.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    }

    setTimeout(() => hole.style.backgroundColor = '', 200);
    stateFlowers.touchesLeft = Math.max(0, stateFlowers.touchesLeft - 1);

    updateUITopos();
    checkGameOverTopos();
  }

  function checkGameOverTopos() {
    if (stateFlowers.flowers >= CONFIG_FLOWERS.targetFlowers) {
      const isPerfect = stateFlowers.touchesLeft === CONFIG_FLOWERS.initialTouches - CONFIG_FLOWERS.targetFlowers;
      endGameTopos(true, isPerfect ? "¡Perfecto!" : "¡Has ganado!", isPerfect ? "¡No fallaste ni una! Has ganado una carta y monedas." : "Has recolectado las flores. Solo ganas monedas.", isPerfect);
    } else if (stateFlowers.lives <= 0) {
      endGameTopos(false, "¡Perdiste!", "Los gatos te han quitado todas las vidas.", false);
    } else if (stateFlowers.touchesLeft <= 0) {
      endGameTopos(false, "¡Sin toques!", "Has agotado todos tus toques.", false);
    }
  }

  function endGameTopos(win, title, text, isPerfect) {
    stateFlowers.isPlaying = false;
    clearInterval(stateFlowers.spawnInterval);
    holes.forEach(h => h.classList.remove('active'));

    if (resultTitleTopos) {
      resultTitleTopos.textContent = title;
      resultTitleTopos.style.color = win ? (isPerfect ? '#FFD700' : '#d15b6a') : '#ff4444';
    }
    if (resultTextTopos) resultTextTopos.textContent = text;
    if (resultScreenTopos) resultScreenTopos.classList.remove('hidden');

    if (win) {
      document.dispatchEvent(new CustomEvent('game:win', {
        detail: { gameIndex: 0, isPerfect: isPerfect, coins: isPerfect ? 20 : 10 }
      }));
    }
  }

  // ==========================================
  // JUEGO 2: PLANETAS
  // ==========================================
  function startPlanets() {
    statePlanets.isPlaying = true;
    statePlanets.found = 0;
    renderPlanetsUI();
  }

  function renderPlanetsUI() {
    const arena = document.getElementById('arena');
    if (!arena) return;

    if (statePlanets.found >= statePlanets.target) {
      arena.innerHTML = `
        <div class="arena-message" style="text-align: center;">
          <h2>¡Has encontrado todos los planetas!</h2>
          <p>Has ganado 20 monedas.</p>
          <button id="close-planets" class="arena-action" style="margin-top: 20px;">Volver al menú</button>
        </div>
      `;
      document.getElementById('close-planets').addEventListener('click', () => {
        document.getElementById('show-game').classList.remove('is-open');
        document.dispatchEvent(new CustomEvent('game:stop'));
      });

      document.dispatchEvent(new CustomEvent('game:win', {
        detail: { gameIndex: 1, isPerfect: true, coins: 20 }
      }));
      return;
    }

    const randomPlanet = planetsData[Math.floor(Math.random() * planetsData.length)];
    statePlanets.currentPlanet = randomPlanet;

    const options = [randomPlanet];
    while(options.length < 3) {
      const fake = planetsData[Math.floor(Math.random() * planetsData.length)];
      if (!options.find(o => o.name === fake.name)) options.push(fake);
    }
    options.sort(() => Math.random() - 0.5);

    arena.innerHTML = `
      <div style="text-align: center; width: 100%; max-width: 400px;">
        <h2 style="color: var(--accent); margin-bottom: 20px;">Encuentra el planeta</h2>
        <div style="font-size: 5rem; margin-bottom: 20px;">${randomPlanet.emoji}</div>
        <p style="font-size: 1.1rem; margin-bottom: 30px; color: var(--text-secondary);">${randomPlanet.desc}</p>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${options.map(opt => `
            <button class="arena-action planet-option" data-name="${opt.name}" style="background: var(--bg-surface); border: 1px solid var(--border-light); color: white; padding: 15px;">
              ${opt.name}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    document.querySelectorAll('.planet-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selectedName = btn.getAttribute('data-name');
        if (selectedName === statePlanets.currentPlanet.name) {
          statePlanets.found++;
          btn.style.background = 'var(--primary)';
          setTimeout(renderPlanetsUI, 300);
        } else {
          btn.style.background = 'red';
          btn.textContent = '¡Incorrecto!';
          setTimeout(() => {
            btn.style.background = 'var(--bg-surface)';
            btn.textContent = selectedName;
          }, 500);
        }
      });
    });
  }

  // ==========================================
  // JUEGO 3: CASINO (Lógica corregida)
  // ==========================================
  function startCasino() {
    stateCasino.isPlaying = true;
    stateCasino.coins = 10;
    renderCasinoUI();
  }

  function renderCasinoUI() {
    const arena = document.getElementById('arena');
    if (!arena) return;

    if (stateCasino.coins <= 0) {
      arena.innerHTML = `
        <div class="arena-message" style="text-align: center;">
          <h2>¡Te has quedado sin monedas!</h2>
          <button id="close-casino" class="arena-action" style="margin-top: 20px;">Volver al menú</button>
        </div>
      `;
      document.getElementById('close-casino').addEventListener('click', () => {
        document.getElementById('show-game').classList.remove('is-open');
        document.dispatchEvent(new CustomEvent('game:stop'));
      });
      return;
    }

    arena.innerHTML = `
      <div style="text-align: center; width: 100%; max-width: 400px;">
        <h2 style="color: var(--accent); margin-bottom: 20px;">Casino de Jack</h2>
        <p style="font-size: 1.2rem; margin-bottom: 20px;">Tus monedas: <strong>${stateCasino.coins} 🪙</strong></p>
        <p style="font-size: 0.9rem; margin-bottom: 30px; color: var(--text-secondary);">Elige una carta. Si sale roja, duplicas. Si sale negra, pierdes la apuesta.</p>

        <div style="display: flex; gap: 20px; justify-content: center;">
          <button id="bet-red" class="arena-action" style="background: #a00; flex: 1;">Rojo ♥️</button>
          <button id="bet-black" class="arena-action" style="background: #333; flex: 1;">Negro ♠️</button>
        </div>
      </div>
    `;

    document.getElementById('bet-red').addEventListener('click', () => playCasino('red'));
    document.getElementById('bet-black').addEventListener('click', () => playCasino('black'));
  }

  function playCasino(choice) {
    const betAmount = stateCasino.coins; // Guardar apuesta
    const isWin = Math.random() > 0.5;
    const result = isWin ? choice : (choice === 'red' ? 'black' : 'red');

    if (isWin) {
      stateCasino.coins *= 2;
    } else {
      stateCasino.coins = Math.floor(stateCasino.coins / 2);
    }

    const arena = document.getElementById('arena');
    arena.innerHTML = `
      <div style="text-align: center;">
        <h2 style="color: ${isWin ? '#4CAF50' : '#ff4444'};">
          ${isWin ? '¡Ganaste!' : '¡Perdiste!'}
        </h2>
        <div style="font-size: 4rem; margin: 20px;">${result === 'red' ? '♥️' : '♠️'}</div>
        <p>${isWin ? 'Has duplicado tu apuesta.' : 'Has perdido la mitad.'}</p>
        <button id="next-casino" class="arena-action" style="margin-top: 20px;">Siguiente</button>
      </div>
    `;

    document.getElementById('next-casino').addEventListener('click', renderCasinoUI);

    // Solo disparamos la ganancia si ganamos
    if (isWin) {
      document.dispatchEvent(new CustomEvent('game:win', {
        detail: { gameIndex: 2, isPerfect: false, coins: betAmount } // Solo sumamos la apuesta ganada
      }));
    }
  }

  // ==========================================
  // EVENTOS GLOBALES
  // ==========================================
  holes.forEach(hole => {
    hole.addEventListener('mousedown', handleHitTopos);
    hole.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handleHitTopos(e);
    }, { passive: false });
  });

  if (restartBtnTopos) restartBtnTopos.addEventListener('click', startTopos);

  if (exitBtnTopos) {
    exitBtnTopos.addEventListener('click', () => {
      stateFlowers.isPlaying = false;
      clearInterval(stateFlowers.spawnInterval);
      if (containerTopos) containerTopos.classList.add('hidden');
      document.dispatchEvent(new CustomEvent('game:stop'));
    });
  }

  document.addEventListener('game:start', function (e) {
    const index = e.detail.index;
    if (index === 0) startTopos();
    else if (index === 1) startPlanets();
    else if (index === 2) startCasino();
  });

  document.addEventListener('game:stop', function () {
    stateFlowers.isPlaying = false;
    clearInterval(stateFlowers.spawnInterval);
    if (containerTopos) containerTopos.classList.add('hidden');
  });

})();