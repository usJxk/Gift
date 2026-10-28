/* =========================================================
   notifications.js — Sistema de Toasts y Sonidos
   ========================================================= */
/* =========================================================
   notifications.js — Sistema de Toasts y Sonidos
   ========================================================= */
(function() {
  'use strict';

  // 1. Configurar el sonido de notificación
  const notifySound = new Audio('information/src/sounds/notify.mp3');
  notifySound.volume = 0.5;

  // 2. Función global para mostrar notificaciones
  window.showNotification = function(options) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Reproducir sonido
    try {
      notifySound.currentTime = 0;
      notifySound.play().catch(() => {}); // Ignorar si el navegador lo bloquea
    } catch(e) {}

    // Valores por defecto
    const title = options.title || '¡Nuevo!';
    const message = options.message || 'Tienes algo nuevo que revisar.';
    const actionText = options.actionText || 'Revisar';
    const onAction = options.onAction || function() {};

    // Crear el elemento
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

    // Forzar animación
    void toast.offsetWidth;
    toast.classList.add('show');

    // Función para cerrar
    const closeToast = () => {
      toast.classList.remove('show');
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    // Eventos
    toast.querySelector('.toast-close').addEventListener('click', closeToast);
    const actionBtn = toast.querySelector('.toast-action');
    actionBtn.addEventListener('click', () => {
      onAction();
      closeToast();
    });

    // Auto-cerrar después de 8 segundos
    const timeoutId = setTimeout(closeToast, 8000);
    toast.addEventListener('mouseenter', () => clearTimeout(timeoutId));
  };

})();