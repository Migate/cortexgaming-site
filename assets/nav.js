// Opens and closes the Games menu in the header.
(function () {
  var btn = document.querySelector('.menu-btn');
  var list = document.getElementById('games-menu');
  if (!btn || !list) return;
  function set(open) {
    list.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { set(!list.classList.contains('open')); });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.menu')) set(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && list.classList.contains('open')) { set(false); btn.focus(); }
  });
})();
