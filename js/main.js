/* ГАЗ Автопрофи — один файл на весь сайт, грузится с defer и ничего не блокирует.
   Всё внутри проверяет, есть ли элемент на странице: файл общий для всех страниц. */
(function () {
  'use strict';

  var TELEFON = '79379999393';
  var POCHTA  = 'samaragazpro@mail.ru';

  /* Скрипт дошёл и работает — только теперь разрешаем прятать блоки до
     прокрутки. Если этой строки не случится, сайт останется полностью видимым. */
  document.documentElement.classList.add('js-gotov');

  /* ---------- меню на телефоне ------------------------------------------ */
  var burger = document.getElementById('burger');
  var menu   = document.getElementById('menu');
  if (burger && menu) {
    burger.addEventListener('click', function () {
      var otkryto = menu.classList.toggle('otkryto');
      burger.setAttribute('aria-expanded', otkryto ? 'true' : 'false');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        menu.classList.remove('otkryto');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- год в подвале --------------------------------------------- */
  var god = document.getElementById('god');
  if (god) god.textContent = new Date().getFullYear();

  /* ---------- появление блоков при прокрутке ----------------------------- */
  var voznik = document.querySelectorAll('.voznik');
  if (voznik.length) {
    if ('IntersectionObserver' in window) {
      var nabl = new IntersectionObserver(function (zapisi) {
        zapisi.forEach(function (z) {
          if (z.isIntersecting) {
            z.target.classList.add('vidno');
            nabl.unobserve(z.target);
          }
        });
      }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
      voznik.forEach(function (el) { nabl.observe(el); });
    } else {
      voznik.forEach(function (el) { el.classList.add('vidno'); });
    }
  }

  /* ---------- набегающие цифры ------------------------------------------- */
  var schetchiki = document.querySelectorAll('[data-schet]');
  if (schetchiki.length && 'IntersectionObserver' in window) {
    var probel = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' '); };
    var nablS = new IntersectionObserver(function (zapisi) {
      zapisi.forEach(function (z) {
        if (!z.isIntersecting) return;
        nablS.unobserve(z.target);
        var el = z.target;
        var cel = parseInt(el.getAttribute('data-schet'), 10);
        var hvost = el.getAttribute('data-hvost') || '';
        if (!cel) return;
        var t0 = null, dlit = 1100;
        var shag = function (t) {
          if (!t0) t0 = t;
          var d = Math.min((t - t0) / dlit, 1);
          var e = 1 - Math.pow(1 - d, 3);
          el.textContent = probel(Math.round(cel * e)) + hvost;
          if (d < 1) requestAnimationFrame(shag);
        };
        requestAnimationFrame(shag);
      });
    }, { threshold: 0.4 });
    schetchiki.forEach(function (el) { nablS.observe(el); });
  }

  /* ---------- калькулятор экономии ---------------------------------------
     Расход газа берём на 15 % выше бензинового — так и выходит на практике.  */
  var probeg = document.getElementById('probeg');
  if (probeg) {
    var polya = {
      probeg:    { el: probeg,                              vyvod: 'probegZ',    hvost: ' км' },
      rashod:    { el: document.getElementById('rashod'),    vyvod: 'rashodZ',    hvost: ' л/100 км' },
      cenaB:     { el: document.getElementById('cenaB'),     vyvod: 'cenaBZ',     hvost: ' ₽/л' },
      cenaG:     { el: document.getElementById('cenaG'),     vyvod: 'cenaGZ',     hvost: ' ₽/л' },
      ustanovka: { el: document.getElementById('ustanovka'), vyvod: 'ustanovkaZ', hvost: ' ₽' }
    };

    var rub = function (n) {
      return Math.round(n).toLocaleString('ru-RU').replace(/\s/g, ' ') + ' ₽';
    };

    var mesyacy = function (n) {
      var ost10 = n % 10, ost100 = n % 100;
      var slovo = 'месяцев';
      if (ost10 === 1 && ost100 !== 11) slovo = 'месяц';
      else if (ost10 >= 2 && ost10 <= 4 && (ost100 < 10 || ost100 >= 20)) slovo = 'месяца';
      return n + ' ' + slovo;
    };

    var zalivka = function (p) {
      var d = (p.value - p.min) / (p.max - p.min) * 100;
      p.style.setProperty('--zapoln', d + '%');
    };

    var schitat = function () {
      var km  = +polya.probeg.el.value;
      var rB  = +polya.rashod.el.value;
      var cB  = +polya.cenaB.el.value;
      var cG  = +polya.cenaG.el.value;
      var ust = +polya.ustanovka.el.value;
      var rG  = rB * 1.15;

      var tratyB = km / 100 * rB * cB;
      var tratyG = km / 100 * rG * cG;
      var vygoda = tratyB - tratyG;

      document.getElementById('itogB').textContent = rub(tratyB) + ' / мес';
      document.getElementById('itogG').textContent = rub(tratyG) + ' / мес';
      document.getElementById('itogE').textContent = vygoda > 0 ? rub(vygoda) : '—';
      document.getElementById('itogGod').textContent = vygoda > 0 ? rub(vygoda * 12) : '—';

      var ok = document.getElementById('itogOk');
      if (vygoda > 0) {
        var m = Math.ceil(ust / vygoda);
        ok.textContent = m > 60 ? 'больше 5 лет' : mesyacy(m);
      } else {
        ok.textContent = 'при таких ценах газ не выгоден';
      }

      Object.keys(polya).forEach(function (k) {
        var p = polya[k];
        if (!p.el) return;
        var v = +p.el.value;
        var pokaz = (k === 'ustanovka' || k === 'probeg')
          ? v.toLocaleString('ru-RU').replace(/\s/g, ' ')
          : v;
        document.getElementById(p.vyvod).textContent = pokaz + p.hvost;
        zalivka(p.el);
      });
    };

    Object.keys(polya).forEach(function (k) {
      if (polya[k].el) polya[k].el.addEventListener('input', schitat);
    });
    schitat();
  }

  /* ---------- форма ------------------------------------------------------
     Сайт статический: сервера, который принял бы заявку, нет. Поэтому форма
     собирает текст и отдаёт его в WhatsApp или в почтовую программу —
     отправляет человек сам, и заявка сразу видна в телефоне мастера.        */
  var forma = document.getElementById('forma');
  if (forma) {
    var status = document.getElementById('status');

    var pokazat = function (tekst, horosho) {
      status.textContent = tekst;
      status.className = 'forma__status ' + (horosho ? 'horosho' : 'ploho');
    };

    var sobrat = function () {
      var ima = forma.ima.value.trim();
      var tel = forma.tel.value.trim();
      var avto = forma.avto.value.trim();
      var usluga = forma.usluga.value;

      if (!ima) { forma.ima.focus(); pokazat('Напишите, как к вам обращаться.', false); return null; }
      if (tel.replace(/\D/g, '').length < 10) { forma.tel.focus(); pokazat('Проверьте номер телефона — по нему мы перезвоним.', false); return null; }
      if (!forma.soglasie.checked) { forma.soglasie.focus(); pokazat('Поставьте согласие на обработку данных — без него отправить нельзя.', false); return null; }

      return 'Заявка с сайта ГАЗ Автопрофи\n'
        + 'Имя: ' + ima + '\n'
        + 'Телефон: ' + tel + '\n'
        + (avto ? 'Автомобиль: ' + avto + '\n' : '')
        + 'Услуга: ' + usluga;
    };

    forma.addEventListener('click', function (e) {
      var knopka = e.target.closest('[data-otpravit]');
      if (!knopka) return;
      var tekst = sobrat();
      if (!tekst) return;

      if (knopka.getAttribute('data-otpravit') === 'whatsapp') {
        window.open('https://wa.me/' + TELEFON + '?text=' + encodeURIComponent(tekst), '_blank', 'noopener');
        pokazat('Открыли WhatsApp — нажмите в нём «Отправить».', true);
      } else {
        window.location.href = 'mailto:' + POCHTA
          + '?subject=' + encodeURIComponent('Заявка с сайта — установка ГБО')
          + '&body=' + encodeURIComponent(tekst);
        pokazat('Открыли вашу почту — нажмите в ней «Отправить».', true);
      }
    });

    forma.addEventListener('submit', function (e) { e.preventDefault(); });
  }

})();
