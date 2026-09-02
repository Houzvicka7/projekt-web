/* ===== Tmavý/světlý režim + plynulé objevení sekcí ===== */
(function () {
  var KLIC = 'smp-tema';
  var koren = document.documentElement;

  function aktualizujPopisek(tema) {
    var el = document.querySelector('.prepinac-tema-text');
    if (el) el.textContent = tema === 'tmavy' ? 'Tmavý mód' : 'Světlý mód';
  }

  function nastav(tema) {
    if (tema === 'tmavy') koren.setAttribute('data-tema', 'tmavy');
    else koren.removeAttribute('data-tema');
    localStorage.setItem(KLIC, tema);
    aktualizujPopisek(tema);
  }

  // nastavit motiv hned při načtení (aby nezablikalo)
  var ulozene = localStorage.getItem(KLIC);
  if (ulozene) nastav(ulozene);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) nastav('tmavy');
  else aktualizujPopisek('svetly');

  document.addEventListener('DOMContentLoaded', function () {
    aktualizujPopisek(koren.getAttribute('data-tema') === 'tmavy' ? 'tmavy' : 'svetly');

    var tlacitko = document.getElementById('tema-tlacitko');
    if (tlacitko) {
      tlacitko.addEventListener('click', function () {
        nastav(koren.getAttribute('data-tema') === 'tmavy' ? 'svetly' : 'tmavy');
      });
    }

    // plynulé objevení sekcí při scrollování
    if ('IntersectionObserver' in window) {
      koren.classList.add('anim-ready');
      var pozorovac = new IntersectionObserver(function (zaznamy) {
        zaznamy.forEach(function (z) {
          if (z.isIntersecting) {
            z.target.classList.add('viditelne');
            pozorovac.unobserve(z.target);
          }
        });
      }, { threshold: 0.06 });
      document.querySelectorAll('section, .hero').forEach(function (el) {
        pozorovac.observe(el);
      });
      // pojistka: kdyby sledování selhalo, zobrazit vše nejpozději po 2 s
      setTimeout(function () {
        document.querySelectorAll('section').forEach(function (el) {
          el.classList.add('viditelne');
        });
      }, 2000);
    }
  });
})();