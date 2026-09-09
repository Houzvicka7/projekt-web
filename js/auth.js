/* ============================================================
   PŘIHLAŠOVÁNÍ PŘES GOOGLE + ROLE Z TABULKY (list „Role“)
   ============================================================
   - Přihlášení: tlačítko „Přihlásit se přes Google“ (bez hesel).
   - Role se ukládají do listu „Role“ v tabulce (sloupce:
     email | jmeno | role), role = admin | redaktor.
   - E-maily v OAUTH_ADMIN_EMAILS jsou NAVŽDY admini.
   - Přihlášený bez role = jen návštěvník (nic mu neotevře).
   ============================================================ */

var OAUTH_ADMIN_EMAILS = ['houzvicka7@gmail.com'];

var Auth = (function () {
  var KLIC_SEANCE = 'smp_g_session';
  var _roleMap = {};
  var _token = null;
  var _tokenVyprsi = 0;

  function nactiSeanci() {
    try { return JSON.parse(localStorage.getItem(KLIC_SEANCE)) || null; }
    catch (e) { return null; }
  }

  function ulozSeanci(seance) {
    if (seance) localStorage.setItem(KLIC_SEANCE, JSON.stringify(seance));
    else localStorage.removeItem(KLIC_SEANCE);
  }

  function jeAdminEmail(email) {
    return OAUTH_ADMIN_EMAILS.indexOf(String(email || '').toLowerCase()) > -1;
  }

  function roleProEmail(email) {
    if (!email) return null;
    if (jeAdminEmail(email)) return 'admin';
    var r = _roleMap[String(email).toLowerCase()];
    if (r && (r.role === 'admin' || r.role === 'redaktor')) return r.role;
    return null;
  }

  function nactiGsi(cb) {
    if (window.google && window.google.accounts && window.google.accounts.oauth2) { cb(); return; }
    var s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = cb;
    s.onerror = function () { cb(); };
    document.head.appendChild(s);
  }

  function dekodujJwt(jwt) {
    try {
      var cast = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(escape(window.atob(cast))));
    } catch (e) { return null; }
  }

  function ziskejToken(zpet) {
    if (typeof OAUTH_CLIENT_ID === 'undefined' || !OAUTH_CLIENT_ID) { zpet(null); return; }
    if (_token && Date.now() < _tokenVyprsi) { zpet(_token); return; }
    nactiGsi(function () {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) { zpet(null); return; }
      try {
        google.accounts.oauth2.initTokenClient({
          client_id: OAUTH_CLIENT_ID,
          scope: 'https://www.googleapis.com/auth/spreadsheets',
          callback: function (odpoved) {
            if (odpoved && odpoved.access_token) {
              _token = odpoved.access_token;
              _tokenVyprsi = Date.now() + ((odpoved.expires_in || 3600) - 60) * 1000;
              zpet(_token);
            } else zpet(null);
          },
          error_callback: function () { zpet(null); }
        }).requestAccessToken();
      } catch (e) { zpet(null); }
    });
  }

  function nactiRole(zpet) {
    if (typeof TABULKA_URL === 'undefined' || !TABULKA_URL) { if (zpet) zpet(); return; }
    var nazev = 'smp_role_' + Date.now();
    var skript = document.createElement('script');
    window[nazev] = function (odpoved) {
      skript.remove();
      delete window[nazev];
      _roleMap = {};
      if (odpoved && odpoved.status === 'ok' && odpoved.table) {
        var hl = odpoved.table.cols.map(function (c) { return String(c.label || c.id || '').trim().toLowerCase(); });
        var najdi = function (klic) {
          for (var i = 0; i < hl.length; i++) if (hl[i].indexOf(klic) > -1) return i;
          return -1;
        };
        var iE = najdi('email'), iJ = najdi('jmeno'), iR = najdi('role');
        odpoved.table.rows.forEach(function (r) {
          var c = r.c || [];
          var hod = function (i) {
            if (!c[i]) return '';
            if (c[i].f !== undefined && c[i].f !== null) return c[i].f;
            return (c[i].v !== undefined && c[i].v !== null) ? c[i].v : '';
          };
          var email = String(hod(iE)).trim().toLowerCase();
          var role = String(hod(iR)).trim().toLowerCase();
          if (email && (role === 'admin' || role === 'redaktor')) {
            _roleMap[email] = { jmeno: String(hod(iJ)).trim(), role: role };
          }
        });
      }
      if (zpet) zpet();
    };
    skript.onerror = function () { skript.remove(); delete window[nazev]; if (zpet) zpet(); };
    skript.src = TABULKA_URL + '?sheet=Role&tqx=out:json;responseHandler:' + nazev + '&t=' + Date.now();
    document.body.appendChild(skript);
  }

  function aktualni() {
    var s = nactiSeanci();
    if (!s || !s.email) return null;
    var role = roleProEmail(s.email);
    return { email: s.email, jmeno: s.jmeno || s.email, role: role || 'navstevnik' };
  }

  function maRoli(role) {
    var u = aktualni();
    if (!u) return false;
    if (role === 'admin') return u.role === 'admin';
    if (role === 'redaktor' || role === 'tym') return u.role === 'redaktor' || u.role === 'admin';
    return false;
  }

  function lidiSeznam() {
    var v = [];
    OAUTH_ADMIN_EMAILS.forEach(function (e) {
      v.push({ email: e.toLowerCase(), jmeno: '(trvalý admin dle konfigurace)', role: 'admin' });
    });
    for (var e in _roleMap) {
      var existuje = v.some(function (x) { return x.email === e; });
      if (!existuje) v.push({ email: e, jmeno: _roleMap[e].jmeno, role: _roleMap[e].role });
    }
    return v;
  }

  function odhlasit() {
    ulozSeanci(null);
    if (window.google && window.google.accounts) google.accounts.id.disableAutoSelect();
  }

  function vykresliPrihlasovaciTlacitko(element, zpet) {
    if (typeof OAUTH_CLIENT_ID === 'undefined' || !OAUTH_CLIENT_ID) {
      element.innerHTML = '<div class="hlaseni hlaseni-chyba">Google přihlášení není nastaveno – webmaster musí vložit OAuth Client ID (Návody).</div>';
      return;
    }
    var tlacitko = document.createElement('button');
    tlacitko.type = 'button';
    tlacitko.className = 'tlacitko-maly tlacitko-google';
    tlacitko.innerHTML = '<strong>G</strong> Přihlásit se';
    tlacitko.addEventListener('click', function () {
      tlacitko.disabled = true;
      prihlasSeGoogle(function (chyba) {
        tlacitko.disabled = false;
        if (chyba && zpet) zpet(chyba);
      });
    });
    element.innerHTML = '';
    element.appendChild(tlacitko);
  }

  // Přihlášení přes Google popup – nepotřebuje žádný vykreslený prvek od Googlu
  function prihlasSeGoogle(zpet) {
    nactiGsi(function () {
      if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
        if (zpet) zpet('Google skript se nepodařilo načíst.');
        return;
      }
      try {
        google.accounts.oauth2.initTokenClient({
          client_id: OAUTH_CLIENT_ID,
          scope: 'openid email profile',
          callback: function (odpoved) {
            if (!odpoved || !odpoved.access_token) {
              if (zpet) zpet('Přihlášení se nepovedlo.');
              return;
            }
            fetch('https://openidconnect.googleapis.com/v1/userinfo', {
              headers: { 'Authorization': 'Bearer ' + odpoved.access_token }
            })
              .then(function (r) { return r.json(); })
              .then(function (u) {
                if (!u || !u.email) {
                  if (zpet) zpet('Google neposlal e-mail.');
                  return;
                }
                ulozSeanci({ email: u.email, jmeno: u.name || u.email, picture: u.picture || '' });
                location.reload();
              })
              .catch(function () { if (zpet) zpet('Nepodařilo se načíst údaje z Googlu.'); });
          },
          error_callback: function () { if (zpet) zpet('Přihlášení se nepovedlo.'); }
        }).requestAccessToken();
      } catch (e) {
        if (zpet) zpet('Přihlášení se nepovedlo.');
      }
    });
  }

  return {
    aktualni: aktualni,
    maRoli: maRoli,
    odhlasit: odhlasit,
    ziskejToken: ziskejToken,
    nactiRole: nactiRole,
    lidiSeznam: lidiSeznam,
    roleProEmail: roleProEmail,
    jeAdminEmail: jeAdminEmail,
    vykresliPrihlasovaciTlacitko: vykresliPrihlasovaciTlacitko
  };
})();

/* ===== Napojení na stránky ===== */
function roleNazev(r) {
  return { admin: 'ADMIN', redaktor: 'Redaktor', navstevnik: 'Návštěvník', cekatel: 'Čeká na schválení' }[r] || '';
}

function zabezpecHtml(text) {
  var d = document.createElement('div');
  d.textContent = text === undefined || text === null ? '' : text;
  return d.innerHTML;
}

function vykresliHlavicku(uzivatel) {
  var box = document.getElementById('uzivatel-box');
  if (!box) return;
  if (!uzivatel) {
    box.innerHTML = '<div class="prihlasovaci-plocha"></div>';
    var plocha = box.querySelector('.prihlasovaci-plocha');
    Auth.vykresliPrihlasovaciTlacitko(plocha, null);
    return;
  }
  var odznakTrida = { admin: 'odznak-admin', redaktor: 'odznak-redaktor', navstevnik: 'odznak-cekatel' }[uzivatel.role] || 'odznak-cekatel';
  box.innerHTML =
    '<span class="uzivatel-jmeno">' + zabezpecHtml(uzivatel.jmeno) + '</span>' +
    '<span class="odznak ' + odznakTrida + '">' + roleNazev(uzivatel.role) + '</span>' +
    (uzivatel.role === 'admin' ? '<a href="admin.html">Správa</a>' : '') +
    '<a href="#" id="odhlasit-btn">Odhlásit</a>';
  var odhlas = document.getElementById('odhlasit-btn');
  if (odhlas) odhlas.addEventListener('click', function (e) {
    e.preventDefault();
    Auth.odhlasit();
    location.href = 'index.html';
  });
}

function vyrizdiStrazce(uzivatel) {
  var pristup = document.body.getAttribute('data-pristup');
  if (!pristup) return;
  var ok = false;
  if (uzivatel) {
    if (pristup === 'admin') ok = uzivatel.role === 'admin';
    else ok = uzivatel.role === 'redaktor' || uzivatel.role === 'admin';
  }
  if (!ok) {
    document.body.innerHTML =
      '<div class="zamitnuto">' +
      '<h1>' + (uzivatel ? 'Nemáš přístup na tuto stránku' : 'Nejsi přihlášený') + '</h1>' +
      '<p>' + (uzivatel ? 'Tato stránka je určena jen pro tým webu.' : 'Pro vstup se přihlas Google účtem.') + '</p>' +
      '<p><a class="tlacitko-maly" href="prihlaseni.html">Přihlásit se přes Google</a></p>' +
      '<p><a href="index.html">Zpět na hlavní stranu</a></p>' +
      '</div>';
  } else {
    document.body.classList.add('pristup-ok');
  }
}

document.addEventListener('DOMContentLoaded', function () {
  var seance = null;
  try { seance = JSON.parse(localStorage.getItem('smp_g_session')); } catch (e) {}

  function dodelano(uzivatel) {
    if (uzivatel && (uzivatel.role === 'redaktor' || uzivatel.role === 'admin')) document.body.classList.add('tym');
    vykresliHlavicku(uzivatel);
    vyrizdiStrazce(uzivatel);
    document.dispatchEvent(new CustomEvent('smp-role', { detail: uzivatel }));
  }

  if (seance && seance.email) {
    vykresliHlavicku({ email: seance.email, jmeno: seance.jmeno, role: Auth.jeAdminEmail(seance.email) ? 'admin' : 'navstevnik' });
    Auth.nactiRole(function () { dodelano(Auth.aktualni()); });
  } else {
    dodelano(null);
  }
});