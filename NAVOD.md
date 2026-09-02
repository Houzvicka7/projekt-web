# ŠTĚPÁNŮV MANUÁL – Školní Mediální Portál

Web je čisté HTML + CSS (žádný WordPress, žádná databáze) → **nejde „rozbít"**,
stojí 0 Kč a později se dá kód přesunout kamkoliv (školní hosting, Webnode,
GitHub Pages, Netlify...).

---

## 0. PŘIHLAŠOVÁNÍ TÝMU (nové!)

- Celý web je pro **návštěvníky otevřený bez přihlášení** – nic jim neschází.
- Oranžové zprávy „Pro redaktory" vidí **pouze** tým (redaktor / ADMIN).
- Přihlášení: tlačítko *Přihlásit se* v hlavičce → stránka `prihlaseni.html`.
- **Demo ADMIN:** `admin@skola.cz` / heslo `admin123` (Štěpán – doporučuji hned
  vytvořit si vlastní účet a demo smazat na stránce `admin.html`).
- Noví lidé se zaregistrují → admin je na stránce **Správa** (`admin.html`)
  povýší na *Redaktora* nebo *ADMINa*.
- **Celý redaktorský návod je teď přímo na webu:** `navody.html` (jen pro tým) –
  nikdo nemusí otevírat žádné složky.
- ⚠️ Simulace: účty se ukládají v prohlížeči daného zařízení (localStorage).
  Až přejdeme na Firebase, vymění se jen soubor `js/auth.js` – stránky zůstanou.

---

## 1. Jak si web otevřít doma (localhost)

- **Nejjednodušší:** otevři soubor `index.html` dvojklikem (otevře se v prohlížeči).
- **Přes VS Code:** nainstaluj rozšíření *Live Server* → pravým tlačítkem na
  `index.html` → *Open with Live Server* → web běží na `http://localhost:5500`.
- **Přes Python (pokud je nainstalovaný):** ve složce webu spusť
  `python -m http.server 8000` a otevři `http://localhost:8000`.

---

## 2. Jak vložit NOVÉ VIDEO (méně než 3 minuty)

1. Nahraj video na **Školní YouTube kanál** (nikdy přímo na web!).
2. Na YouTube klikni na video → *Sdílet* → *Vložit (Embed)* → zkopíruj kód
   začínající `<iframe ...>...</iframe>`.
3. Otevři `tv-reportaze.html` (nebo `index.html` pro nejnovější video).
4. Najdi komentář `===== ZDE VLOŽ EMBED KÓD =====` a nahraď celý blok:

```html
<div class="video">
  <iframe src="https://www.youtube-nocookie.com/embed/ID_VIDEA"
          title="Název videa" allowfullscreen></iframe>
</div>
```

(ID videa najdeš v adrese YouTube za `watch?v=` – jen to zkopíruj.)
5. Ulož a obnov prohlížeč. **Hotovo.**

---

## 3. Jak vydat NOVÉ ČÍSLO ČASOPISU

1. PDF nahraj do složky **Časopis** na školním Google Disku → pravým tlačítkem →
   *Sdílet* → *Kdokoli s odkazem* → zkopíruj odkaz.
2. Otevři `casopis.html`, zkopíruj celý blok `<!-- ===== Číslo ... -->` ...
   `<!-- ===== KONEC ===== -->` a vlož ho **nahoru** do archivu.
3. Přepiš číslo, datum a do `href="..."` u tlačítka vlož odkaz na PDF.
4. Titulní stranu: až bude obrázek obálky, nahraď `<div class="obalka">...</div>`
   za `<img src="obalka-1-2026.jpg" alt="Obálka čísla 1">`.
5. **Hotovo.**

---

## 4. Jak vložit FORMULÁŘ PRO NÁPADY

1. Vytvoř Google Formulář (na školním účtu) → *Odeslat* → ikona `<>` →
   zkopíruj HTML kód.
2. Otevři `tym-kontakt.html`, najdi `===== ZDE VLOŽ EMBED GOOGLE FORMULÁŘE =====`
   a nahraď zástupný blok zkopírovaným kódem (místo `div class="video"`).
3. **Hotovo.**

---

## 5. Jak přidat BLESKOVOU ZPRÁVU nebo ČLENA TÝMU

- V `index.html` zkopíruj celý `<div class="karta zprava">...</div>` a vlož ho
  jako první v sekci Bleskové zprávy. Přepiš datum, nadpis a text.
- V `tym-kontakt.html` zkopíruj `<div class="karta clen">...</div>` a přepiš údaje.

---

## 6. Jak změnit BARVY WEBU

V souboru `css/styl.css` na samém začátku jsou všechny barvy na jednom místě.
Změníš jednu hodnotu → změní se celý web.

---

## 7. Bezpečnost a pravidla (NEMĚNIT!)

- **Admin práva:** pouze Štěpán + garant/učitel. Soubory můžou upravovat jen oni.
- **Redaktoři:** posílají texty/PDF webmasterovi nebo mají přístup jen do složky na Google Disku.
- **GDPR:** na web a YouTube patří POUZE žáci se souhlasem – vždy ověřit u vedení školy.
- **Zálohování:** 1× měsíčně zkopíruj celou složku webu (např. na Google Disk
  nebo flashku) a přejmenuj ji podle data (např. `zaloha-web-2026-03-01`).

---

## 8. Přesun na internet (až bude hotovo)

Kód funguje všude – stačí nahrát tyto soubory na:
- **Netlify Drop** (zdarma, přetáhnutí složky do prohlížeče – nejjednodušší),
- **GitHub Pages** (zdarma, ideální pro školní projekt),
- nebo školní hosting / Webnode přes FTP.

Pravidlo: pokud vkládání nového článku zabere víc než 3 minuty → systém je moc
složitý a je potřeba ho zjednodušit.