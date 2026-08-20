# Sajat penzvalto PWA

Ez egy kezdo alap egy iPhone-on is hasznalhato penzvalto PWA-hoz.

## Ingyenes eszkozok

- VS Code: a fajlok szerkesztesehez.
- Egy modern bongeszo: teszteleshez.
- GitHub fiok: kesobb ingyenes feltolteshez.
- GitHub Pages vagy Netlify: kesobb ingyenes HTTPS-es megosztashoz.
- iPhone Safari: a kezdokepernyore telepiteshez.

## Fajlok

- `index.html`: az oldal szerkezete.
- `style.css`: a kinezet.
- `app.js`: a penzvalto logikaja.
- `manifest.webmanifest`: PWA beallitasok.
- `sw.js`: offline mukodeshez szukseges service worker.
- `icons/`: alkalmazasikonok.

## Helyi inditas VS Code-ban

1. Nyisd meg VS Code-ban ezt a mappat: `penzvalto-pwa`.
2. Nyiss egy Terminalt a VS Code-ban.
3. Ird be:

   ```bash
   python -m http.server 8000
   ```

4. Nyisd meg a bongeszoben:

   ```text
   http://localhost:8000
   ```

5. Ha latod a penzvaltot, az alap mukodik.

## iPhone-os telepites kesobb

Az iPhone nem a sajat geped `localhost` cimet fogja hasznalni. A projektet kesobb fel kell tolteni egy HTTPS-es ingyenes tarhelyre, peldaul GitHub Pages-re vagy Netlify-ra. Utana iPhone-on Safariban nyisd meg az oldalt, majd Megosztas -> Hozzaadas a Fokepernyohoz.
