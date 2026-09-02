/* ============================================================
   OBSAH Z GOOGLE TABULEK – "mini-CMS" (žádné editování kódu)
   ============================================================
   JEDNORÁZOVÉ NASTAVENÍ (webmaster):
   1) Vytvoř Google Tabulku. Do 1. řádku přesně tyto sloupce:
        datum | typ | nadpis | text | odkaz
      typ = zprava | video | casopis
      (video → do "odkaz" adresu YouTube videa,
       casopis → do "odkaz" adresu PDF z Google Disku,
       nejnovější řádky dávej vždy NAHORU)
   2) Soubor → Sdílet → Publikovat na web → formát CSV → Publikovat
      → zkopíruj odkaz (končí .../pub?output=csv)
   3) Odkaz vlož níže do TABULKA_URL. Hotovo.
   Redaktoři pak jen přidávají řádky v mobilní aplikaci Tabulek.
   POZOR: publikovaná tabulka je veřejně čitelná – nic soukromého!
   ============================================================ */

var TABULKA_URL = ''; // ← SEM VLOŽ CSV ODKAZ Z PUBLIKOVANÉ TABULKY
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

function zobrazZpravy(zpravy) {
  var seznam = document.getElementById('zpravy-list');
  if (!seznam) return;
  zpravy.forEach(function (z) {
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
    seznam.appendChild(karta);
  });
  skryjZalohu('zpravy-zaloha');
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
      cist.className = 'tlacitko tlacitko-hlavni';
      cist.href = 'ctecka.html?pdf=' + encodeURIComponent(c.odkaz);
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

function vykresli(radky) {
  if (!radky.length) return;
  var hlavicka = radky[0].map(function (s) { return s.trim().toLowerCase(); });
  var ix = {
    datum: hlavicka.indexOf('datum'),
    typ: hlavicka.indexOf('typ'),
    nadpis: hlavicka.indexOf('nadpis'),
    text: hlavicka.indexOf('text'),
    odkaz: hlavicka.indexOf('odkaz')
  };
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
    if (polozka.typ === 'video') videa.push(polozka);
    else if (polozka.typ === 'casopis') cisla.push(polozka);
    else zpravy.push(polozka);
  });
  if (zpravy.length) zobrazZpravy(zpravy);
  if (videa.length) zobrazVidea(videa);
  if (cisla.length) zobrazCisla(cisla);
}

document.addEventListener('DOMContentLoaded', function () {
  if (YOUTUBE_KANAL_URL) {
    var odkaz = document.getElementById('odkaz-youtube');
    if (odkaz) odkaz.href = YOUTUBE_KANAL_URL;
  }
  if (!TABULKA_URL) return; // tabulka zatím nenastavena – zůstane ukázkový obsah
  fetch(TABULKA_URL + (TABULKA_URL.indexOf('?') > -1 ? '&' : '?') + 't=' + Date.now())
    .then(function (odpoved) { return odpoved.text(); })
    .then(function (text) { vykresli(parsujCsv(text)); })
    .catch(function () { /* tabulku nelze načíst – zůstane ukázkový obsah */ });
});