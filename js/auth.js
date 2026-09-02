/* ============================================================
   PŘIHLAŠOVÁNÍ – zatím simulace (účty se ukládají v prohlížeči,
   localStorage). Až bude Firebase, vymění se jen tento soubor –
   názvy funkcí zůstanou stejné, stránky se nemusí měnit.

   DEMO ADMIN:  admin@skola.cz  /  heslo: admin123
   ============================================================ */
var Auth = (function () {
  var KLIC = 'smp_uzivatele';
  var KLIC_SEANCE = 'smp_prihlaseny';

  function uzivatele() {
    var data = localStorage.getItem(KLIC);
    if (!data) {
      var vychozi = [{ jmeno: 'Štěpán', email: 'admin@skola.cz', heslo: 'admin123', role: 'admin' }];
      localStorage.setItem(KLIC, JSON.stringify(vychozi));
      return vychozi;
    }
    return JSON.parse(data);
  }

  function ulozit(seznam) { localStorage.setItem(KLIC, JSON.stringify(seznam)); }

  function verejny(u) { return { jmeno: u.jmeno, email: u.email, role: u.role }; }

  function registrace(jmeno, email, heslo) {
    email = (email || '').trim().toLowerCase();
    if (!jmeno || !email || !heslo) return { ok: false, chyba: 'Vyplň prosím všechna pole.' };
    if (heslo.length < 6) return { ok: false, chyba: 'Heslo musí mít alespoň 6 znaků.' };
    var seznam = uzivatele();
    for (var i = 0; i < seznam.length; i++) {
      if (seznam[i].email === email) return { ok: false, chyba: 'Účet s tímto e-mailem už existuje.' };
    }
    seznam.push({ jmeno: jmeno.trim(), email: email, heslo: heslo, role: 'cekatel' });
    ulozit(seznam);
    return { ok: true };
  }

  function prihlas(email, heslo) {
    email = (email || '').trim().toLowerCase();
    var seznam = uzivatele();
    for (var i = 0; i < seznam.length; i++) {
      if (seznam[i].email === email && seznam[i].heslo === heslo) {
        localStorage.setItem(KLIC_SEANCE, email);
        return { ok: true, uzivatel: verejny(seznam[i]) };
      }
    }
    return { ok: false, chyba: 'Nesprávný e-mail nebo heslo.' };
  }

  function odhlasit() { localStorage.removeItem(KLIC_SEANCE); }

  function aktualni() {
    var email = localStorage.getItem(KLIC_SEANCE);
    if (!email) return null;
    var seznam = uzivatele();
    for (var i = 0; i < seznam.length; i++) {
      if (seznam[i].email === email) return verejny(seznam[i]);
    }
    return null;
  }

  function maRoli(role) {
    var u = aktualni();
    if (!u) return false;
    if (role === 'admin') return u.role === 'admin';
    if (role === 'redaktor') return u.role === 'redaktor' || u.role === 'admin';
    if (role === 'tym') return u.role === 'redaktor' || u.role === 'admin';
    return false;
  }

  function zmenRoli(email, role) {
    if (!maRoli('admin')) return { ok: false, chyba: 'Nemáš admin práva.' };
    var seznam = uzivatele();
    for (var i = 0; i < seznam.length; i++) {
      if (seznam[i].email === email) { seznam[i].role = role; ulozit(seznam); return { ok: true }; }
    }
    return { ok: false, chyba: 'Uživatel nenalezen.' };
  }

  function smazUzivatele(email) {
    if (!maRoli('admin')) return { ok: false, chyba: 'Nemáš admin práva.' };
    var seznam = uzivatele();
    var novy = [];
    for (var i = 0; i < seznam.length; i++) {
      if (seznam[i].email !== email) novy.push(seznam[i]);
    }
    ulozit(novy);
    return { ok: true };
  }

  function vsechnyUzivatele() {
    if (!maRoli('admin')) return [];
    return uzivatele().map(verejny);
  }

  return {
    prihlas: prihlas, registrace: registrace, odhlasit: odhlasit,
    aktualni: aktualni, maRoli: maRoli, zmenRoli: zmenRoli,
    smazUzivatele: smazUzivatele, vsechnyUzivatele: vsechnyUzivatele
  };
})();

/* ===== Automatické nastavení každé stránky podle role ===== */
document.addEventListener('DOMContentLoaded', function () {
  var u = Auth.aktualni();

  // Redaktorské oranžové zprávy: viditelné POUZE pro tým (redaktor/admin)
  if (u && (u.role === 'redaktor' || u.role === 'admin')) {
    document.body.classList.add('tym');
  }

  // Box v hlavičce (přihlásit / jméno + role + odhlásit)
  var box = document.getElementById('uzivatel-box');
  if (box) {
    if (!u) {
      box.innerHTML = '<a class="tlacitko-maly" href="prihlaseni.html">Přihlásit se</a>';
    } else {
      var roleNazev = { admin: 'ADMIN', redaktor: 'Redaktor', cekatel: 'Čeká na schválení' }[u.role];
      var odznakTrida = { admin: 'odznak-admin', redaktor: 'odznak-redaktor', cekatel: 'odznak-cekatel' }[u.role];
      box.innerHTML =
        '<span class="uzivatel-jmeno">' + u.jmeno + '</span>' +
        '<span class="odznak ' + odznakTrida + '">' + roleNazev + '</span>' +
        (u.role === 'admin' ? '<a href="admin.html">Správa</a>' : '') +
        '<a href="#" id="odhlasit-btn">Odhlásit</a>';
      var odhlas = document.getElementById('odhlasit-btn');
      if (odhlas) odhlas.addEventListener('click', function (e) {
        e.preventDefault();
        Auth.odhlasit();
        location.href = 'index.html';
      });
    }
  }

  // Ochrana stránek: <body data-pristup="tym"> nebo data-pristup="admin"
  var pristup = document.body.getAttribute('data-pristup');
  if (pristup) {
    var pristupPovolen =
      u && (pristup === 'tym' ? (u.role === 'redaktor' || u.role === 'admin') : u.role === 'admin');
    if (!pristupPovolen) {
      document.body.innerHTML =
        '<div class="zamitnuto">' +
        '' +
        '<h1>' + (u ? 'Nemáš přístup na tuto stránku' : 'Nejsi přihlášený') + '</h1>' +
        '<p>' + (u ? 'Tato stránka je určena jen pro tým webu.' : 'Pro vstup se prosím přihlas.') + '</p>' +
        '<a class="tlacitko tlacitko-drugi" href="prihlaseni.html">Přihlásit se</a> ' +
        '<a class="tlacitko tlacitko-ram" href="index.html">Zpět na hlavní stranu</a>' +
        '</div>';
    } else {
      document.body.classList.add('pristup-ok');
    }
  }
});