  function launchCurrentGame() {
    var slide = slides[currentIndex];
    if (!slide) return;
    var title = $('.title-game', slide);
    var desc  = $('.description-game', slide);
    var showGame  = $('#show-game');
    var titleSlot = $('#title-game-content');
    var descSlot  = $('#description-arena');

    if (titleSlot && title) titleSlot.textContent = title.textContent;
    if (descSlot && desc)   descSlot.textContent  = desc.textContent;

    // Añadimos la animación de carga antes de mostrar la arena
    playLoadingAnimation(function() {
      if (showGame) {
        showGame.classList.add('is-open');
        showGame.setAttribute('aria-hidden', 'false');
      }
      document.dispatchEvent(new CustomEvent('game:start', {
        detail: { index: currentIndex, id: slide.id }
      }));
    });
  }