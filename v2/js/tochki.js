/* Указатели сбоку и полоса хода вверху — только для версии с листанием.

   Считают сами, от разделов страницы, а не от остановок раскладки: так
   файл не зависит от внутренностей listanie.js, и если механизм листания
   выключен (телефон, тачпад), полоса хода всё равно работает, а точки
   прячет CSS. */
(function () {
  'use strict';

  var razdely = Array.prototype.slice.call(
    document.querySelectorAll('main > section[id], footer[id]'));
  if (!razdely.length) return;

  var podpisi = {
    nachalo:      'Начало',
    pochemu:      'Почему к нам',
    kalkulyator:  'Экономия',
    ceny:         'Цены',
    dop:          'Дополнительные работы',
    kak:          'Как проходит',
    'o-nas':      'О компании',
    raboty:       'Наши работы',
    oborudovanie: 'Оборудование',
    voprosy:      'Вопросы',
    zayavka:      'Записаться',
    kontakty:     'Контакты'
  };

  /* --- точки сбоку ------------------------------------------------------ */
  var korob = document.getElementById('tochki');
  var knopki = [];

  if (korob) {
    razdely.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      var imya = podpisi[s.id] || s.id;
      b.setAttribute('aria-label', 'Перейти: ' + imya);
      b.title = imya;
      b.addEventListener('click', function () {
        /* Ведём браузером: listanie.js сам перехватывает клики по своим
           якорям и доводит плавно, а если листание выключено — сработает
           обычный переход. */
        location.hash = s.id;
      });
      korob.appendChild(b);
      knopki.push(b);
    });
    korob.classList.add('est');
  }

  /* --- полоса хода ------------------------------------------------------ */
  var polosa = document.getElementById('hod');

  var otmetit = function () {
    var y = window.scrollY;
    var okno = window.innerHeight;

    if (polosa) {
      var predel = Math.max(1, document.documentElement.scrollHeight - okno);
      polosa.style.width = Math.min(100, (y / predel) * 100).toFixed(1) + '%';
    }

    if (!knopki.length) return;

    /* Текущий — тот раздел, чья середина ближе всего к середине окна.
       Считаем именно так, а не «верх раздела выше середины экрана»: в режиме
       экранов раздел может занимать несколько экранов, и по верхней кромке
       подсветка застревала бы на первом. */
    var seredina = y + okno / 2;
    var luchshiy = 0;
    var minRazn = Infinity;

    razdely.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var verh = r.top + y;
      var niz = r.bottom + y;
      var razn = Math.abs((verh + niz) / 2 - seredina);
      /* Если середина окна внутри раздела — он и есть текущий, без сравнений. */
      if (seredina >= verh && seredina < niz) razn = -1;
      if (razn < minRazn) { minRazn = razn; luchshiy = i; }
    });

    knopki.forEach(function (b, i) {
      b.setAttribute('aria-current', i === luchshiy ? 'true' : 'false');
    });
  };

  otmetit();
  var zhdyom = false;
  window.addEventListener('scroll', function () {
    if (zhdyom) return;
    zhdyom = true;
    requestAnimationFrame(function () { otmetit(); zhdyom = false; });
  }, { passive: true });
  window.addEventListener('resize', otmetit);
})();
