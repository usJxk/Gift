/* =========================================================
   settings.js — Configuración, Temas, Música e Iframes
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {

  // =========================================================
  // 1. SISTEMA DE TEMAS (Cargando CSS dinámicamente)
  // =========================================================
  const themeLinks = {
    dark: 'information/css/background/dark.css',
    night: 'information/css/background/night.css',
    light: 'information/css/background/light.css'
  };

  let currentTheme = localStorage.getItem('theme-pref') || 'dark';
  let currentFont = parseInt(localStorage.getItem('font-pref')) || 16;

  function loadTheme(themeName) {
    let link = document.getElementById('theme-stylesheet');
    if (!link) {
      link = document.createElement('link');
      link.id = 'theme-stylesheet';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
    link.href = themeLinks[themeName];
    document.body.className = document.body.className.replace(/theme-\w+/g, '').trim() + ' theme-' + themeName;
  }

  function applyFontSize(size) {
    document.documentElement.style.fontSize = size + 'px';
  }

  loadTheme(currentTheme);
  applyFontSize(currentFont);

  // Botones de Tema
  const btnDark = document.getElementById('dark-mode');
  const btnNight = document.getElementById('night-mode');
  const btnLight = document.getElementById('sun-mode');
  const fontRange = document.getElementById('font-size-range');

  if (btnDark) btnDark.addEventListener('click', () => { currentTheme = 'dark'; loadTheme(currentTheme); });
  if (btnNight) btnNight.addEventListener('click', () => { currentTheme = 'night'; loadTheme(currentTheme); });
  if (btnLight) btnLight.addEventListener('click', () => { currentTheme = 'light'; loadTheme(currentTheme); });

  if (fontRange) {
    fontRange.value = currentFont;
    fontRange.addEventListener('input', (e) => {
      currentFont = parseInt(e.target.value);
      applyFontSize(currentFont);
    });
  }

  // Guardar / Cancelar
  const saveBtn = document.getElementById('save-configuration-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      localStorage.setItem('theme-pref', currentTheme);
      localStorage.setItem('font-pref', currentFont);
      if (window.showNotification) {
        window.showNotification({
          title: 'Configuración Guardada',
          message: 'Tus preferencias de tema y letra se han guardado.',
          actionText: 'Ok'
        });
      }
    });
  }

  const cancelBtn = document.getElementById('cancel-configuration');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      currentTheme = localStorage.getItem('theme-pref') || 'dark';
      currentFont = parseInt(localStorage.getItem('font-pref')) || 16;
      loadTheme(currentTheme);
      applyFontSize(currentFont);
      if (fontRange) fontRange.value = currentFont;
    });
  }

  // =========================================================
  // 2. REPRODUCTOR DE MÚSICA DE FONDO
  // =========================================================
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.createElement('button');

  musicToggle.className = 'music-toggle';
  musicToggle.innerHTML = '🔇';
  musicToggle.title = 'Reproducir música';
  document.body.appendChild(musicToggle);

  let isMusicMuted = localStorage.getItem('music-muted') === 'true';

  function updateMusicState() {
    if (isMusicMuted) {
      musicToggle.innerHTML = '🔇';
      musicToggle.classList.add('paused');
      if (bgMusic) bgMusic.pause();
    } else {
      musicToggle.innerHTML = '🎵';
      musicToggle.classList.remove('paused');
      if (bgMusic) {
        bgMusic.volume = 0.3;
        bgMusic.play().catch(() => console.log("Autoplay bloqueado"));
      }
    }
  }

  musicToggle.addEventListener('click', () => {
    isMusicMuted = !isMusicMuted;
    localStorage.setItem('music-muted', isMusicMuted);
    updateMusicState();
  });

  updateMusicState();

  // =========================================================
  // 3. MODAL IFRAME (Para abrir Spotify o YouTube)
  // =========================================================
  const iframeModal = document.getElementById('iframe-modal');
  const iframe = document.getElementById('modal-iframe');
  const btnCloseIframe = document.getElementById('close-iframe');
  const btnSpotify = document.getElementById('open-spotify');

  window.openIframe = function(url) {
    if (iframeModal && iframe) {
      iframe.src = url;
      iframeModal.classList.add('is-open');
      iframeModal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }
  };

  if (btnSpotify) {
    btnSpotify.addEventListener('click', () => {
      const playlistUrl = "https://open.spotify.com/embed/playlist/447fcIqoezMJ00yTHBcaEO?utm_source=generator&theme=0";
      window.openIframe(playlistUrl);
    });
  }

  if (btnCloseIframe) {
    btnCloseIframe.addEventListener('click', () => {
      iframeModal.classList.remove('is-open');
      iframeModal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
      setTimeout(() => { iframe.src = ''; }, 400);
    });
  }

  if (iframeModal) {
    iframeModal.addEventListener('click', (e) => {
      if (e.target === iframeModal) {
        btnCloseIframe.click();
      }
    });
  }

});