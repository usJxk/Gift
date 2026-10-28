/* =========================================================
   main.js — Lógica principal (Unificado y Optimizado)
   ========================================================= */
(function () {
  'use strict';

  var $ = function (sel, ctx) { try { return (ctx || document).querySelector(sel); } catch (e) { return null; } };
  var $$ = function (sel, ctx) { try { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); } catch (e) { return []; } };

  var STORAGE_KEY = 'birthday-config-v1';
  var defaultConfig = { volume: 70, playlist: '', fontSize: 16, theme: 'dark', primary: '#8b3a44', orientation: 'row' };
  var config = Object.assign({}, defaultConfig, (function() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch(e) { return {}; } })());

  // Variables globales de monedas y cartas
  var userCoins = parseInt(localStorage.getItem('user-coins')) || 0;
  var purchasedCards = JSON.parse(localStorage.getItem('purchased-cards')) || [1];

  function hexToRgba(hex, alpha) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    return 'rgba(' + parseInt(h.substring(0,2),16) + ',' + parseInt(h.substring(2,4),16) + ',' + parseInt(h.substring(4,6),16) + ',' + alpha + ')';
  }
  function lighten(hex, percent) {
    var h = hex.replace('#', ''); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var r = Math.min(255, Math.round(parseInt(h.substring(0,2),16) + (255 - parseInt(h.substring(0,2),16)) * (percent/100)));
    var g = Math.min(255, Math.round(parseInt(h.substring(2,4),16) + (255 - parseInt(h.substring(2,4),16)) * (percent/100)));
    var b = Math.min(255, Math.round(parseInt(h.substring(4,6),16) + (255 - parseInt(h.substring(4,6),16)) * (percent/100)));
    return '#' + [r,g,b].map(function(n){ return ('0'+n.toString(16)).slice(-2); }).join('');
  }

  function applyConfig(cfg) {
    var root = document.documentElement;
    root.style.fontSize = cfg.fontSize + 'px';
    root.style.setProperty('--primary', cfg.primary);
    root.style.setProperty('--primary-glow', hexToRgba(cfg.primary, 0.45));
    root.style.setProperty('--accent', lighten(cfg.primary, 20));
    root.style.setProperty('--accent-hover', lighten(cfg.primary, 30));
    root.style.setProperty('--border-glow', hexToRgba(cfg.primary, 0.35));
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' theme-' + cfg.theme;
    var carousel = $('#games-carousel'); if (carousel) carousel.classList.toggle('is-column', cfg.orientation === 'column');
    var video = $('.bg-video'); if (video) video.volume = Math.min(1, Math.max(0, cfg.volume / 100));
  }

  /* Configuración UI */
  var musicRange = $('#musicrange'); if (musicRange) { musicRange.value = config.volume; musicRange.addEventListener('input', function(e){ config.volume = parseInt(e.target.value,10)||0; }); }
  var fontRange = $('#font-size-range'); if (fontRange) { fontRange.value = config.fontSize; fontRange.addEventListener('input', function(e){ config.fontSize = parseInt(e.target.value,10)||16; document.documentElement.style.fontSize = config.fontSize + 'px'; }); }
  var urlMusic = $('#urlmusic'); if (urlMusic) { urlMusic.value = config.playlist || ''; urlMusic.addEventListener('input', function(e){ config.playlist = e.target.value.trim(); }); }

  [['#dark-mode','dark'], ['#night-mode','night'], ['#sun-mode','light']].forEach(function(p) {
    var btn = $(p[0]); if (btn) btn.addEventListener('click', function(){ config.theme = p[1]; applyConfig(config); });
  });

  var colorInput = $('#set-color'); var addColor = $('#add-color');
  if (addColor && colorInput) addColor.addEventListener('click', function(){ var v = colorInput.value.trim(); if(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) { config.primary = v.charAt(0)==='#'?v:'#'+v; applyConfig(config); } });

  var rowBtn = $('#row'); var columnBtn = $('#column');
  if (rowBtn) rowBtn.addEventListener('click', function(){ config.orientation = 'row'; applyConfig(config); });
  if (columnBtn) columnBtn.addEventListener('click', function(){ config.orientation = 'column'; applyConfig(config); });

  var modeMenu = $('#mode-menu'); var optionsBtn = $('#options'); var closeMenu = $('#close-menu');
  if (optionsBtn) {
    optionsBtn.addEventListener('click', function(){
      if (window.playLoadingAnimation) {
        window.playLoadingAnimation(function() {
          modeMenu.classList.add('is-open');
          modeMenu.setAttribute('aria-hidden','false');
          document.body.classList.add('no-scroll');
        });
      } else {
        modeMenu.classList.add('is-open');
        modeMenu.setAttribute('aria-hidden','false');
        document.body.classList.add('no-scroll');
      }
    });
  }

  if (closeMenu) {
    closeMenu.addEventListener('click', function(){
      modeMenu.classList.remove('is-open');
      modeMenu.setAttribute('aria-hidden','true');
      document.body.classList.remove('no-scroll');
    });
  }

  var saveBtn = $('#save-configuration-btn'); var cancelBtn = $('#cancel-configuration');
  if (saveBtn) saveBtn.addEventListener('click', function(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); applyConfig(config); closeMenu.click(); });
  if (cancelBtn) cancelBtn.addEventListener('click', function(){ config = Object.assign({}, defaultConfig, JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}')); applyConfig(config); if(musicRange)musicRange.value=config.volume; if(fontRange)fontRange.value=config.fontSize; closeMenu.click(); });

  /* Animación de Carga y Sonido */
  var clickSound = new Audio('information/src/sounds/button.mp3'); clickSound.preload = 'auto';
  document.addEventListener('click', function (e) {
    if (e.target.closest('.btn-anim')) { clickSound.currentTime = 0; clickSound.volume = config.volume / 100; clickSound.play().catch(function(){}); }
  });

  window.playLoadingAnimation = function(callback) {
    var overlay = $('#loading-overlay'); if (!overlay) { callback(); return; }
    overlay.innerHTML = ''; overlay.classList.add('is-active');
    var box = document.createElement('div'); box.className = 'loading-box anim-fade-spin-in'; overlay.appendChild(box);
    setTimeout(function() {
      box.classList.remove('anim-fade-spin-in'); box.classList.add('anim-fade-spin-out'); overlay.classList.remove('is-active');
      setTimeout(callback, 400);
    }, 800);
  };

  /* Carrusel y Juegos */
  var gameContent = $('#game-content'); var closeGame = $('#close-game-container'); var gamesBtn = $('#activity-1');
  var carousel = $('#games-carousel'); var slides = $$('.game-slide'); var dots = $$('.game-dots .dot');
  var navLeft = $('#navigation-left'); var navRight = $('#navigation-right'); var playSec = $('#play-game-secondary');
  var currentIndex = 0; var totalSlides = slides.length;

  function goToSlide(index) {
    if (!carousel || totalSlides === 0) return;
    currentIndex = Math.max(0, Math.min(index, totalSlides - 1));
    carousel.style.transform = (carousel.classList.contains('is-column') ? 'translateY(-' : 'translateX(-') + (currentIndex * 100) + '%)';
    dots.forEach(function (d, i) { d.classList.toggle('is-active', i === currentIndex); d.setAttribute('aria-selected', i === currentIndex); });
    if (navLeft) navLeft.disabled = currentIndex === 0; if (navRight) navRight.disabled = currentIndex === totalSlides - 1;
  }

  if (navLeft) navLeft.addEventListener('click', function(){ goToSlide(currentIndex - 1); });
  if (navRight) navRight.addEventListener('click', function(){ goToSlide(currentIndex + 1); });
  dots.forEach(function(d){ d.addEventListener('click', function(){ goToSlide(parseInt(d.getAttribute('data-index'),10)); }); });

  function launchCurrentGame() {
    var slide = slides[currentIndex]; if (!slide) return;
    var title = $('.title-game', slide); var desc = $('.description-game', slide);

    if ($('#title-game-content') && title) $('#title-game-content').textContent = title.textContent;
    if ($('#description-arena') && desc) $('#description-arena').textContent = desc.textContent;

    playLoadingAnimation(function() {
      if ($('#show-game')) {
        $('#show-game').classList.add('is-open');
        $('#show-game').setAttribute('aria-hidden','false');
      }
      document.dispatchEvent(new CustomEvent('game:start', { detail: { index: currentIndex, id: slide.id } }));
    });
  }

  $$('.button-games .play-game, .button-games .continue').forEach(function(btn) {
    btn.addEventListener('click', function() { var s = btn.closest('.game-slide'); if(s) goToSlide(parseInt(s.getAttribute('data-index'),10)); launchCurrentGame(); });
  });
  if (playSec) playSec.addEventListener('click', launchCurrentGame);

  if (gamesBtn) gamesBtn.addEventListener('click', function(){ gameContent.classList.add('is-open'); gameContent.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll'); if (window.__initGames) window.__initGames(); });
  if (closeGame) closeGame.addEventListener('click', function(){ gameContent.classList.remove('is-open'); gameContent.setAttribute('aria-hidden','true'); document.body.classList.remove('no-scroll'); $('#show-game').classList.remove('is-open'); $('#show-game').setAttribute('aria-hidden','true'); });

  var goBack = $('#go-to-mainMenu'); if (goBack) goBack.addEventListener('click', function(){ $('#show-game').classList.remove('is-open'); $('#show-game').setAttribute('aria-hidden','true'); document.dispatchEvent(new CustomEvent('game:stop')); });

  var infoBtn = $('#open-info'); var infoBox = $('#view-info');
  if (infoBtn) infoBtn.addEventListener('click', function(){ var o = infoBox.classList.toggle('is-open'); infoBtn.setAttribute('aria-expanded', o); infoBox.setAttribute('aria-hidden', !o); });

  /* Swipe */
  if (carousel) {
    var sx=0, sy=0, dx=0, dy=0, drag=false;
    carousel.addEventListener('touchstart', function(e){ if(e.touches.length!==1)return; sx=e.touches[0].clientX; sy=e.touches[0].clientY; dx=0; dy=0; drag=true; }, {passive:true});
    carousel.addEventListener('touchmove', function(e){ if(!drag)return; dx=e.touches[0].clientX-sx; dy=e.touches[0].clientY-sy; }, {passive:true});
    carousel.addEventListener('touchend', function(){ if(!drag)return; drag=false; var d = carousel.classList.contains('is-column') ? dy : dx; if(Math.abs(d)>50) goToSlide(currentIndex + (d<0?1:-1)); }, {passive:true});
  }

  /* =========================================================
     TIMERS Y MODALES EXTERNOS (Spotify)
     ========================================================= */

  // 1. Contador para el próximo cumpleaños (1 año exacto)
  var bDay = $('#birthday');
  if(bDay) {
    var nextBirthday = new Date();
    nextBirthday.setFullYear(nextBirthday.getFullYear() + 1);

    setInterval(function(){
      var now = new Date();
      var df = nextBirthday - now;
      if(df < 0) df = 0;

      var p = function(n){ return n < 10 ? '0' + n : n; };

      var days = Math.floor(df / (1000 * 60 * 60 * 24));
      var hours = Math.floor((df % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((df % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((df % (1000 * 60)) / 1000);

      bDay.textContent = p(days) + 'd:' + p(hours) + 'h:' + p(minutes) + 'm:' + p(seconds) + 's';
    }, 1000);
  }

  // 2. Tiempo transcurrido en la página
  var timeEl = $('#timelapse');
  if(timeEl) {
    var start = Date.now();
    setInterval(function(){
      var t = Math.floor((Date.now() - start) / 1000);
      var p = function(n){ return n < 10 ? '0' + n : n; };
      timeEl.textContent = p(Math.floor(t / 3600)) + ':' + p(Math.floor((t % 3600) / 60)) + ':' + p(t % 60);
    }, 1000);
  }

  // 3. Modal para abrir el Iframe de Spotify
  var iframeModal = document.getElementById('iframe-modal');
  var iframe = document.getElementById('modal-iframe');
  var btnCloseIframe = document.getElementById('close-iframe');
  var btnSpotify = document.getElementById('open-spotify');

  if (btnSpotify) {
    btnSpotify.addEventListener('click', function() {
      if (iframeModal && iframe) {
        var playlistUrl = "https://open.spotify.com/embed/playlist/447fcIqoezMJ00yTHBcaEO?utm_source=generator&theme=0";
        iframe.src = playlistUrl;
        iframeModal.classList.add('is-open');
        iframeModal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      }
    });
  }

  if (btnCloseIframe) {
    btnCloseIframe.addEventListener('click', function() {
      iframeModal.classList.remove('is-open');
      iframeModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      setTimeout(function() { iframe.src = ''; }, 400);
    });
  }

  if (iframeModal) {
    iframeModal.addEventListener('click', function(e) {
      if (e.target === iframeModal) {
        btnCloseIframe.click();
      }
    });
  }

  /* =========================================================
     SISTEMA DE CARTAS Y DESBLOQUEO
     ========================================================= */
  var lettersContent = document.getElementById('letters-content');
  var btnCartas = document.getElementById('activity-2');
  var btnCloseLetters = document.getElementById('close-letters');

  var letterModal = document.getElementById('letter-modal');
  var btnCloseLetterModal = document.getElementById('close-letter-modal');
  var modalLetterTitle = document.getElementById('modal-letter-title');
  var modalLetterText = document.getElementById('modal-letter-text');

  function openLetterModal(title, textContent) {
    if (!letterModal) return;
    if (modalLetterTitle) modalLetterTitle.textContent = title;
    if (modalLetterText) modalLetterText.innerHTML = `<p>${textContent.replace(/\n/g, '</p><p>')}</p>`;
    letterModal.classList.add('is-open');
    letterModal.setAttribute('aria-hidden', 'false');
  }

  if (btnCloseLetterModal) {
    btnCloseLetterModal.addEventListener('click', function() {
      letterModal.classList.remove('is-open');
      letterModal.setAttribute('aria-hidden', 'true');
    });
  }

  if (letterModal) {
    letterModal.addEventListener('click', function(e) {
      if (e.target === letterModal) {
        letterModal.classList.remove('is-open');
        letterModal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  if (btnCartas) {
    btnCartas.addEventListener('click', function() {
      if(lettersContent) {
        lettersContent.classList.add('is-open');
        lettersContent.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateLettersUI();
      }
    });
  }

  if (btnCloseLetters) {
    btnCloseLetters.addEventListener('click', function() {
      if(lettersContent) {
        lettersContent.classList.remove('is-open');
        lettersContent.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('no-scroll');
      }
    });
  }

  function updateLettersUI() {
    var gameCompleteEl = document.getElementById('game-complete');
    var completedGames = gameCompleteEl ? parseInt(gameCompleteEl.textContent) : 0;

    var cartasTextos = {
      1: "Cuando te reis de algo tonto que sucede, cambia por completo el ambiente, \n Cada vez que te escucho carcajear, mi corazon se regocija por tu alegria \n Quisiera oirte reir y sonreir por siempre, ¿Acaso hay algo en que entristecerse en esta vida? \n Querida amiga, ¡Sigue gozando! Mientras yo pueda respirar",
      2: "Oid firmemente a mis versos, ¡Porque hoy es un dia unico para una persona incomparable! \n Tus pesares te llenaron de colera y de melancolia, mi corazon se llena de desolacion al escucharte gemir por tus heridas\n Quisiera arreglarte como el alfarero, pero mis capacidades no me llegan a eso \n Presto atencion a tus inquietudes y mi cuerpo tiembla y yo me aflijo y me lleno de temor por el momento en los que tus ojos se llenan de lagrimas \n ¡Hermosa mujer! ¿Porque has de preocuparte en tus dias de desolacion? ¿Acaso no puedes contar todo para mi, acaso hay algo que te aflige en estos dias, acaso no puedes pedir ayuda a un ser supremo? Te digo de que prestare oido para que dejes de entristecerte, ¡Calma ahora y disfruta de esta vida!",
      3: "Tu, hermosa mujer, ¿Quien te habra dicho todas las palabras que escribo ahora mismo?, \n¡Qusiera envolverte en mis brazos para poder alejar cualquier mal de ti! Lo sabre, cuando sonrias y me envuelvas tu tambien con tus brazos \n ¡Amor, cariño y misericordia es lo que siento por ti! ¿Quien se atrevera en hacer daño a una dulce flor? \n Recuerda, amada y querida damisela, haz el bien, ya que constanmente cosechamos lo que sembramos\n No hagas el mal, consejo de experiencia te dare para ti cuando escuche tu pregunta '¿Acaso tu deseas el mal hacia tus enemigos o amigos?' \n Te dare sabiduria si tus palabras son las correctas; busca y anela la paz y la justicia, deseo lo mejor para ti hermosa y calida luz"
    };

    for (var i = 1; i <= 3; i++) {
      var card = document.getElementById('letter-' + i);
      if (!card) continue;

      if (purchasedCards.includes(i) || i <= completedGames || i === 1) {
        card.classList.remove('locked');
        card.classList.add('unlocked');
        card.querySelector('.letter-icon').textContent = '✉️';
        card.querySelector('.letter-desc').textContent = '¡Carta desbloqueada!';

        var btn = card.querySelector('button');
        btn.className = 'read-letter-btn';
        btn.textContent = 'Leer Carta';

        btn.onclick = (function(index) {
          return function() {
            openLetterModal("Carta de Jack #" + index, cartasTextos[index]);
          };
        })(i);

      } else {
        card.classList.remove('unlocked');
        card.classList.add('locked');
        card.querySelector('.letter-icon').textContent = '🔒';
        card.querySelector('.letter-desc').textContent = 'Compra esta carta en la tienda o completa más juegos.';

        var btn = card.querySelector('.buy-letter-btn') || card.querySelector('button');
        btn.className = 'buy-letter-btn';
        btn.textContent = 'Ir a la Tienda';
        btn.onclick = function() {
          document.getElementById('letters-content').classList.remove('is-open');
          document.getElementById('activity-3').click();
        };
      }
    }
  }

  /* =========================================================
     SISTEMA DE NOTIFICACIONES (TOASTS)
     ========================================================= */
  window.showNotification = function(options) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const title = options.title || '¡Nuevo!';
    const message = options.message || 'Tienes algo nuevo que revisar.';
    const actionText = options.actionText || 'Revisar';
    const onAction = options.onAction || function() {};

    const toast = document.createElement('div');
    toast.className = 'toast';

    toast.innerHTML = `
      <div class="toast-header">
        <h4 class="toast-title">${title}</h4>
        <button class="toast-close" aria-label="Cerrar">&times;</button>
      </div>
      <p class="toast-message">${message}</p>
      <button class="toast-action btn-anim">${actionText}</button>
    `;

    container.appendChild(toast);
    void toast.offsetWidth;
    toast.classList.add('show');

    const closeToast = () => {
      toast.classList.remove('show');
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    const actionBtn = toast.querySelector('.toast-action');
    actionBtn.addEventListener('click', () => {
      onAction();
      closeToast();
    });

    const timeoutId = setTimeout(closeToast, 8000);
    toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  };

  /* =========================================================
     SISTEMA DE TIENDA Y MONEDAS
     ========================================================= */
  var shopContent = document.getElementById('shop-content');
  var btnTienda = document.getElementById('activity-3');
  var btnCloseShop = document.getElementById('close-shop');
  var shopCoinsDisplay = document.getElementById('shop-coins-display');

  function updateCoinDisplays() {
    var hudCoins = document.getElementById('hud-coins');
    if (hudCoins) hudCoins.textContent = userCoins;

    var coinsCount1 = document.getElementById('coins-count-1');
    if (coinsCount1) coinsCount1.textContent = userCoins;

    if (shopCoinsDisplay) shopCoinsDisplay.textContent = userCoins + ' 🪙';
  }

  if (btnTienda) {
    btnTienda.addEventListener('click', function() {
      if (shopContent) {
        shopContent.classList.add('is-open');
        shopContent.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
        updateCoinDisplays();
        updateShopUI();
      }
    });
  }

  if (btnCloseShop) {
    btnCloseShop.addEventListener('click', function() {
      shopContent.classList.remove('is-open');
      shopContent.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    });
  }

  function updateShopUI() {
    for (var i = 1; i <= 3; i++) {
      var card = document.getElementById('shop-letter-' + i);
      if (!card) continue;

      var btn = card.querySelector('.buy-letter-btn');

      if (purchasedCards.includes(i)) {
        card.classList.add('owned');
        btn.textContent = 'Comprada';
        btn.disabled = true;
      }
    }
  }

  document.querySelectorAll('#shop-content .buy-letter-btn').forEach(function(btn) {
    if (btn.hasAttribute('disabled')) return;

    btn.addEventListener('click', function() {
      var price = parseInt(btn.getAttribute('data-price'));
      var cardId = parseInt(btn.getAttribute('data-id'));

      if (userCoins >= price) {
        userCoins -= price;
        purchasedCards.push(cardId);

        localStorage.setItem('user-coins', userCoins);
        localStorage.setItem('purchased-cards', JSON.stringify(purchasedCards));

        updateCoinDisplays();
        updateShopUI();
        updateLettersUI();

        if (window.showNotification) {
          window.showNotification({
            title: '¡Compra Exitosa! 🎉',
            message: 'Has desbloqueado una nueva carta en tu colección.',
            actionText: 'Genial'
          });
        }
      } else {
        if (window.showNotification) {
          window.showNotification({
            title: 'Monedas Insuficientes 🪙',
            message: 'Juega más al minijuego para conseguir monedas.',
            actionText: 'Entendido'
          });
        }
      }
    });
  });

  /* =========================================================
     EVENTO: GANAR JUEGO (Único y centralizado)
     ========================================================= */
  document.addEventListener('game:win', function(e) {
    var detail = e.detail;

    // 1. Sumar monedas
    userCoins += detail.coins;
    localStorage.setItem('user-coins', userCoins);
    updateCoinDisplays();

    // 2. Lógica del contador de juegos completados
    // Solo contamos si fue Perfecto (isPerfect) o si es un juego distinto al de topos
    if (detail.isPerfect || detail.gameIndex > 0) {

      // Leemos cuántos juegos se completaron antes (guardado en localStorage)
      var totalGamesCompleted = parseInt(localStorage.getItem('games-completed')) || 0;

      // Si es la primera vez que se gana este nivel en esta sesión, sumamos 1
      // (Para evitar que se sume infinito si repites el juego)
      var gameCompleteEl = document.getElementById('game-complete');
      var currentDisplayed = gameCompleteEl ? parseInt(gameCompleteEl.textContent) : 0;

      // Actualizamos el contador visual
      if (gameCompleteEl) {
        var newTotal = Math.min(3, currentDisplayed + 1); // Máximo 3 juegos
        gameCompleteEl.textContent = newTotal;
        localStorage.setItem('games-completed', newTotal); // Guardar en navegador
      }

      // 3. Actualizar Estrellas en la tarjeta del Juego 1
      if (detail.isPerfect) {
        var slide = document.getElementById('card-game-1');
        if (slide) {
          var starsEl = slide.querySelector('[id^="stars-count"]');
          if (starsEl) {
            var currentStars = parseInt(starsEl.textContent) || 0;
            starsEl.textContent = currentStars + 1;
          }
        }

        var hudStars = document.getElementById('hud-stars');
        if (hudStars) hudStars.textContent = parseInt(hudStars.textContent) + 1;
      }
    }
  });

  // Inicializar el contador desde el localStorage al cargar la página
  var savedGames = localStorage.getItem('games-completed');
  if (savedGames) {
    var gameCompleteEl = document.getElementById('game-complete');
    if (gameCompleteEl) gameCompleteEl.textContent = savedGames;
  }
  window.updateCoinDisplays = updateCoinDisplays; // Hacerla global

  applyConfig(config);
  goToSlide(0);
  updateCoinDisplays();
})();