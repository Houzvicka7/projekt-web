/* ============================================================
   OBSAH Z GOOGLE TABULEK – "mini-CMS" (žádné editování kódu)
   ============================================================
   JEDNORÁZOVÉ NASTAVENÍ (webmaster):
   1) Vytvoř Google Tabulku. Do 1. řádku přesně tyto sloupce:
        datum | typ | nadpis | text | odkaz
      typ = zprava | video | casopis
      (video → do "odkaz" adresu YouTube videa,
       casopis → do "odkaz" adresu PDF z Google Disku,
       ŘÁDKY KLIDNĚ PŘIDÁVEJ DOLŮ – web si je sám seřadí podle data)
      Sloupec "datum" je POVINNÝ u zpráv a časopisu – formát 1.1.2026 nebo 1. 1. 2026.
      Nový obsah se na webu objeví sám, do minuty – nic není potřeba nahrávat.
      Sloupec "text" je NEPOVINNÝ.
      2. řádek může být ukázka formátu – na web se nezobrazí
      (zobrazují se jen řádky s typem zprava / video / casopis).
   2) V tabulce klikni na Sdílet → Přístup: Kdokoli s odkazem (Čtenář).
      Odkaz na tabulku už je vložený níže – víc nic nenastavuješ.
   Redaktoři pak jen přidávají řádky v mobilní aplikaci Tabulek.
   POZOR: publikovaná tabulka je veřejně čitelná – nic soukromého!
   ============================================================ */

var TABULKA_URL = 'https://docs.google.com/spreadsheets/d/1cb8J_Mm54yUh6akT00mrUtfTEoc-8wfVEzQSGsE6u1E/gviz/tq'; // tvá tabulka (sdílená: Kdokoli s odkazem)
var TABULKA_EDIT_URL = 'https://docs.google.com/spreadsheets/d/1cb8J_Mm54yUh6akT00mrUtfTEoc-8wfVEzQSGsE6u1E/edit';
var TABULKA_ID = '1cb8J_Mm54yUh6akT00mrUtfTEoc-8wfVEzQSGsE6u1E';
var OAUTH_CLIENT_ID = '391341334196-oflts9v0j5ucbrp2k1jlj2bgkj1ukpqs.apps.googleusercontent.com'; // Google Cloud Console – návod v Redaktorských návodech, sekce Google ukládání
var YOUTUBE_KANAL_URL = ''; // ← SEM VLOŽ ODKAZ NA ŠKOLNÍ YOUTUBE KANÁL

function parsujCsv(text) {
  var radky = [], radek = [], pole = '', vUvozovkach = false, i, znak;
  for (i = 0; i < text.length; i++) {
    znak = text.charAt(i);
    if (vUvozovkach) {
      if (znak === '"') {
        if (text.charAt(i + 1) === '"') { pole += '"'; i++; }
        else vUvozovkach = false;
      } else pole += znak;
    } else if (znak === '"') vUvozovkach = true;
    else if (znak === ',') { radek.push(pole); pole = ''; }
    else if (znak === '\n') { radek.push(pole); radky.push(radek); radek = []; pole = ''; }
    else if (znak !== '\r') pole += znak;
  }
  if (pole !== '' || radek.length) { radek.push(pole); radky.push(radek); }
  return radky;
}

function hodnota(radek, index) {
  return index > -1 && radek[index] ? String(radek[index]).trim() : '';
}

function skryjZalohu(id) {
  var el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

// Z odkazu na Google Disk udělá náhled pro čtečku (…/view?usp=sharing → /preview)
function driveNahled(odkaz) {
  var m = String(odkaz).match(/drive\.google\.com\/file\/d\/([A-Za-z0-9_-]+)/);
  return m ? 'https://drive.google.com/file/d/' + m[1] + '/preview' : odkaz;
}

function youtubeId(odkaz) {
  var m = String(odkaz).match(/(?:youtu\.be\/|v=|\/shorts\/|\/embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : '';
}

function videoBlok(z) {
  var obal = document.createElement('div');
  obal.className = 'video';
  var id = youtubeId(z.odkaz);
  if (id) {
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + id;
    ifr.title = z.nadpis || 'Video';
    ifr.setAttribute('allowfullscreen', '');
    obal.appendChild(ifr);
  }
  return obal;
}

function sestavZpravuKartu(z) {
  var karta = document.createElement('div');
  karta.className = 'karta zprava';
  if (z.datum) {
    var d = document.createElement('span');
    d.className = 'datum';
    d.textContent = z.datum;
    karta.appendChild(d);
  }
  if (z.nadpis) {
    var h = document.createElement('h3');
    h.textContent = z.nadpis;
    karta.appendChild(h);
  }
  if (z.text) {
    var p = document.createElement('p');
    p.textContent = z.text;
    karta.appendChild(p);
  }
  if (document.body.classList.contains('tym')) {
    var upr = document.createElement('button');
    upr.className = 'tlacitko-upravit';
    upr.type = 'button';
    upr.textContent = 'Upravit';
    upr.addEventListener('click', function () { upravZpravu(karta, z); });
    karta.appendChild(upr);
  }
  return karta;
}

function zobrazZpravy(zpravy) {
  var seznam = document.getElementById('zpravy-list');
  if (!seznam) return;
  zpravy.forEach(function (z) {
    seznam.appendChild(sestavZpravuKartu(z));
  });
  skryjZalohu('zpravy-zaloha');
}

function upravZpravu(karta, z) {
  if (karta.dataset.uprava === 'ano') return;
  karta.dataset.uprava = 'ano';
  karta.innerHTML =
    '<div class="upr-form">' +
    '<label>Datum</label><input class="upr-datum">' +
    '<label>Nadpis</label><input class="upr-nadpis">' +
    '<label>Text</label><input class="upr-text">' +
    '<div class="upr-tlacitka">' +
    '<button type="button" class="tlacitko tlacitko-zeleny upr-ulozit">Uložit</button>' +
    '<button type="button" class="tlacitko-maly upr-zrusit">Zrušit</button>' +
    '</div>' +
    '<div class="upr-hlaseni"></div>' +
    '</div>';
  karta.querySelector('.upr-datum').value = z.datum;
  karta.querySelector('.upr-nadpis').value = z.nadpis;
  karta.querySelector('.upr-text').value = z.text;
  karta.querySelector('.upr-zrusit').addEventListener('click', function () {
    karta.replaceWith(sestavZpravuKartu(z));
  });
  karta.querySelector('.upr-ulozit').addEventListener('click', function () {
    var hlaseni = karta.querySelector('.upr-hlaseni');
    var nove = [
      karta.querySelector('.upr-datum').value.trim(),
      z.typ,
      karta.querySelector('.upr-nadpis').value.trim(),
      karta.querySelector('.upr-text').value.trim(),
      z.odkaz
    ];
    if (!nove[0] || !nove[2]) {
      hlaseni.className = 'upr-hlaseni hlaseni-chyba';
      hlaseni.textContent = 'Datum a nadpis jsou povinné.';
      return;
    }
    if (!OAUTH_CLIENT_ID) {
      hlaseni.className = 'upr-hlaseni hlaseni-chyba';
      hlaseni.textContent = 'Ukládání není nastaveno – webmaster musí vložit OAuth Client ID (Návody).';
      return;
    }
    hlaseni.className = 'upr-hlaseni';
    hlaseni.textContent = 'Ukládám…';
    apiUlozRadek({ datum: z.datum, typ: z.typ, nadpis: z.nadpis }, nove, function (ok) {
      if (ok) {
        hlaseni.className = 'upr-hlaseni hlaseni-ok';
        hlaseni.textContent = 'Uloženo – aktualizuji…';
        nactiTabulku();
      } else {
        hlaseni.className = 'upr-hlaseni hlaseni-chyba';
        hlaseni.textContent = 'Uložení se nepovedlo – přihlas se znovu a zkontroluj přístup k tabulce.';
      }
    });
  });
}

function zobrazVidea(videa) {
  var seznam = document.getElementById('videa-list');
  if (seznam) {
    videa.forEach(function (v) {
      var karta = document.createElement('div');
      karta.className = 'karta';
      karta.appendChild(videoBlok(v));
      if (v.nadpis) {
        var h = document.createElement('h3');
        h.textContent = v.nadpis;
        karta.appendChild(h);
      }
      if (v.text) {
        var p = document.createElement('p');
        p.textContent = v.text;
        karta.appendChild(p);
      }
      seznam.appendChild(karta);
    });
    skryjZalohu('videa-zaloha');
  }
  var nej = document.getElementById('video-list');
  if (nej && videa.length) {
    nej.appendChild(videoBlok(videa[0]));
    skryjZalohu('video-zaloha');
  }
}

function zobrazCisla(cisla) {
  var seznam = document.getElementById('cisla-list');
  if (!seznam) return;
  cisla.forEach(function (c) {
    var karta = document.createElement('div');
    karta.className = 'karta';
    var obalka = document.createElement('div');
    obalka.className = 'obalka';
    obalka.style.boxShadow = 'none';
    obalka.style.marginBottom = '14px';
    var cis = document.createElement('span');
    cis.className = 'cislo';
    cis.textContent = c.nadpis || 'Nové číslo';
    obalka.appendChild(cis);
    if (c.datum) {
      var rok = document.createElement('span');
      rok.className = 'rok';
      rok.textContent = c.datum;
      obalka.appendChild(rok);
    }
    karta.appendChild(obalka);
    if (c.text) {
      var pop = document.createElement('p');
      pop.textContent = c.text;
      karta.appendChild(pop);
    }
    if (c.odkaz) {
      var rada = document.createElement('div');
      rada.className = 'tlacitka';
      var cist = document.createElement('a');
      cist.className = 'tlacitko tlacitko-zeleny';
      cist.href = 'ctecka.html?pdf=' + encodeURIComponent(driveNahled(c.odkaz));
      cist.textContent = 'Přečíst';
      rada.appendChild(cist);
      var stah = document.createElement('a');
      stah.className = 'tlacitko tlacitko-drugi';
      stah.href = c.odkaz;
      stah.setAttribute('download', '');
      stah.textContent = 'Stáhnout PDF';
      rada.appendChild(stah);
      karta.appendChild(rada);
    }
    seznam.appendChild(karta);
  });
  skryjZalohu('cisla-zaloha');
}

function parsujDatum(text) {
  var s = String(text || '').trim();
  if (!s) return null;
  var m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return new Date(+m[1], +m[2] - 1, +m[3]).getTime();
  m = s.match(/^(\d{1,2})\.\s*(\d{1,2})\.\s*(\d{4})/);
  if (m) return new Date(+m[3], +m[2] - 1, +m[1]).getTime();
  return null;
}

// Nejnovější položky nahoře; řádky bez data zůstávají v pořadí z tabulky (na konci)
function seradPodleData(seznam) {
  return seznam
    .map(function (p, i) { return { p: p, i: i, cas: parsujDatum(p.datum) }; })
    .sort(function (a, b) {
      var ca = a.cas === null ? -Infinity : a.cas;
      var cb = b.cas === null ? -Infinity : b.cas;
      if (ca !== cb) return cb - ca;
      return a.i - b.i;
    })
    .map(function (x) { return x.p; });
}

// Když je sekce prázdná, redaktoři uvidí krátkou nápovědu (návštěvníci nic)
function pridejNapoveduPokudPrazdne(id, text) {
  var el = document.getElementById(id);
  if (!el || el.children.length) return;
  if (!document.body.classList.contains('tym')) return;
  var p = document.createElement('p');
  p.className = 'upozorneni redaktorska';
  p.textContent = text;
  el.appendChild(p);
}

function vykresli(radky) {
  if (!radky.length) return;
  ['zpravy-list', 'videa-list', 'cisla-list', 'video-list'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  var hlavicka = radky[0].map(function (s) { return s.trim().toLowerCase(); });
  // hlavička může obsahovat i vysvětlivky (např. 'datum př. 1.1.2026') – hledáme slovo kdekoliv v buňce
  var najdi = function (klic) {
    return hlavicka.findIndex(function (s) { return s.indexOf(klic) > -1; });
  };
  var ix = { datum: najdi('datum'), typ: najdi('typ'), nadpis: najdi('nadpis'), text: najdi('text'), odkaz: najdi('odkaz') };
  var zpravy = [], videa = [], cisla = [];
  radky.slice(1).forEach(function (r) {
    var polozka = {
      datum: hodnota(r, ix.datum),
      typ: hodnota(r, ix.typ).toLowerCase(),
      nadpis: hodnota(r, ix.nadpis),
      text: hodnota(r, ix.text),
      odkaz: hodnota(r, ix.odkaz)
    };
    if (!polozka.nadpis && !polozka.text && !polozka.odkaz) return;
    if ((polozka.typ === 'zprava' || polozka.typ === 'casopis') && !polozka.datum) return; // datum je povinný u zpráv a čísel
    if (polozka.typ === 'zprava') zpravy.push(polozka);
    else if (polozka.typ === 'video') videa.push(polozka);
    else if (polozka.typ === 'casopis') cisla.push(polozka);

    // jiné typy (např. ukázkový 2. řádek tabulky) se na web nezobrazí
  });
  zpravy = seradPodleData(zpravy);
  videa = seradPodleData(videa);
  cisla = seradPodleData(cisla);

  if (zpravy.length) zobrazZpravy(zpravy);
  if (videa.length) zobrazVidea(videa);
  if (cisla.length) zobrazCisla(cisla);
  pridejNapoveduPokudPrazdne('zpravy-list', 'Zatím tu žádná zpráva není – přidej ji panelem výš nebo v tabulce.');
  pridejNapoveduPokudPrazdne('videa-list', 'Zatím tu žádné video není – přidej ho panelem výš nebo v tabulce.');
  pridejNapoveduPokudPrazdne('cisla-list', 'Zatím tu žádné číslo časopisu není – přidej ho panelem výš nebo v tabulce.');
}

/* ===== Token pro Google API spravuje auth.js (Auth.ziskejToken) ===== */
function ziskejToken(zpet) {
  Auth.ziskejToken(zpet);
}

function apiPridejRadek(hodnoty, hotovo) {
  ziskejToken(function (token) {
    if (!token) { hotovo(false); return; }
    fetch('https://sheets.googleapis.com/v4/spreadsheets/' + TABULKA_ID + '/values/A:E:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [hodnoty] })
    }).then(function (r) { return r.ok; }).catch(function () { return false; }).then(hotovo);
  });
}

function apiUlozRadek(hledany, hodnoty, hotovo) {
  ziskejToken(function (token) {
    if (!token) { hotovo(false); return; }
    fetch('https://sheets.googleapis.com/v4/spreadsheets/' + TABULKA_ID + '/values/A:E', {
      headers: { 'Authorization': 'Bearer ' + token }
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var radky = data.values || [];
        var idx = -1;
        for (var i = 1; i < radky.length; i++) {
          var r = radky[i] || [];
          if ((r[1] || '') === hledany.typ && (r[2] || '') === hledany.nadpis && (r[0] || '') === hledany.datum) { idx = i; break; }
        }
        if (idx === -1) return false;
        var cislo = idx + 1;
        return fetch('https://sheets.googleapis.com/v4/spreadsheets/' + TABULKA_ID + '/values/A' + cislo + ':E' + cislo + '?valueInputOption=USER_ENTERED', {
          method: 'PUT',
          headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ values: [hodnoty] })
        }).then(function (r) { return r.ok; });
      })
      .catch(function () { return false; })
      .then(hotovo);
  });
}

var _posledniObsah = null;

function nactiTabulku() {
  // JSONP – data z tabulky se načtou jako skript, funguje i z lokálního souboru
  var nazev = 'smp_tabulka_' + Date.now();
  var skript = document.createElement('script');
  window[nazev] = function (odpoved) {
    skript.remove();
    delete window[nazev];
    if (!odpoved || odpoved.status !== 'ok' || !odpoved.table) return;
    var tab = odpoved.table;
    var radky = [tab.cols.map(function (c) { return String(c.label || c.id || '').trim().toLowerCase(); })];
    tab.rows.forEach(function (r) {
      radky.push((r.c || []).map(function (b) {
        if (!b) return '';
        var hod = (b.f !== undefined && b.f !== null) ? b.f : b.v;
        return hod === undefined || hod === null ? '' : String(hod).trim();
      }));
    });
    var otisk = JSON.stringify(radky);
    if (otisk === _posledniObsah) return; // nic nového – nemusíme překreslovat
    _posledniObsah = otisk;
    vykresli(radky);
  };
  skript.onerror = function () { skript.remove(); delete window[nazev]; };
  skript.src = TABULKA_URL + '?tqx=out:json;responseHandler:' + nazev + '&t=' + Date.now();
  document.body.appendChild(skript);
}

function inicializujPanely() {
  var panely = document.querySelectorAll('.pridat-panel');
  if (!panely.length) return;
  panely.forEach(function (panel) {
    panel.innerHTML =
      '<div class="karta pridat-panel-karta">' +
      '<button type="button" class="pridat-prepinac">＋ Přidat obsah</button>' +
      '<div class="pridat-telo" style="display:none">' +
      '<div class="mrizka-form">' +
      '<div><label>Typ</label><select class="pp-typ"><option value="video">video</option><option value="zprava">zprava</option><option value="casopis">casopis</option></select></div>' +
      '<div><label>Datum (1.1.2026)</label><input class="pp-datum"></div>' +
      '<div class="cele-radek"><label>Nadpis</label><input class="pp-nadpis"></div>' +
      '<div class="cele-radek"><label>Odkaz (YouTube video nebo PDF z Disku)</label><input class="pp-odkaz"></div>' +
      '<div class="cele-radek"><label>Text (nepovinný)</label><input class="pp-text"></div>' +
      '</div>' +
      '<div class="pridat-tlacitka">' +
      '<button type="button" class="tlacitko tlacitko-zeleny pp-publikovat">Publikovat</button>' +
      '<button type="button" class="tlacitko-maly pp-kopirovat">Zkopírovat řádek a otevřít tabulku</button>' +
      '</div>' +
      '<div class="upr-hlaseni pp-hlaseni"></div>' +
      '</div>' +
      '</div>';
    var telo = panel.querySelector('.pridat-telo');
    var prepinac = panel.querySelector('.pridat-prepinac');
    prepinac.addEventListener('click', function () {
      var otevreno = telo.style.display !== 'none';
      telo.style.display = otevreno ? 'none' : 'block';
      prepinac.textContent = otevreno ? '＋ Přidat obsah' : '− Skrýt';
    });
    var hlaseni = panel.querySelector('.pp-hlaseni');
    var prevezmi = function () {
      return [
        panel.querySelector('.pp-datum').value.trim(),
        panel.querySelector('.pp-typ').value,
        panel.querySelector('.pp-nadpis').value.trim(),
        panel.querySelector('.pp-text').value.trim(),
        panel.querySelector('.pp-odkaz').value.trim()
      ];
    };
    panel.querySelector('.pp-publikovat').addEventListener('click', function () {
      var hodnoty = prevezmi();
      if (!hodnoty[2] && !hodnoty[4]) {
        hlaseni.className = 'upr-hlaseni hlaseni-chyba';
        hlaseni.textContent = 'Doplň alespoň nadpis nebo odkaz.';
        return;
      }
      hlaseni.className = 'upr-hlaseni';
      hlaseni.textContent = 'Publikuji…';
      apiPridejRadek(hodnoty, function (ok) {
        if (ok) {
          hlaseni.className = 'upr-hlaseni hlaseni-ok';
          hlaseni.textContent = 'Publikováno – obsah se za chvíli objeví na stránce.';
          panel.querySelector('.pp-nadpis').value = '';
          panel.querySelector('.pp-text').value = '';
          panel.querySelector('.pp-odkaz').value = '';
          nactiTabulku();
        } else {
          hlaseni.className = 'upr-hlaseni hlaseni-chyba';
          hlaseni.textContent = OAUTH_CLIENT_ID
            ? 'Publikování se nepovedlo – zkus to znovu nebo přidej řádek přes Zkopírovat.'
            : 'Ukládání není nastaveno – vlož OAuth Client ID (Návody) nebo použij Zkopírovat řádek.';
        }
      });
    });
    panel.querySelector('.pp-kopirovat').addEventListener('click', function () {
      var radek = prevezmi().join('\t');
      try { navigator.clipboard.writeText(radek); } catch (e) {}
      window.open(TABULKA_EDIT_URL, '_blank');
    });
    var d = new Date();
    panel.querySelector('.pp-datum').value = d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  });
}

document.addEventListener('DOMContentLoaded', function () {
  if (YOUTUBE_KANAL_URL) {
    var odkaz = document.getElementById('odkaz-youtube');
    if (odkaz) odkaz.href = YOUTUBE_KANAL_URL;
  }
  if (!TABULKA_URL) return;
  if (document.body.classList.contains('tym')) inicializujPanely();
  nactiTabulku();
  setInterval(nactiTabulku, 60000); // kontrola nového obsahu každou minutu
});