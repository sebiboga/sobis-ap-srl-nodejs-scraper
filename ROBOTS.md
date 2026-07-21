# Robots.txt Analysis — SOBIS AP S.R.L.

Sursa: https://sobis-ap.ro/robots.txt

## Situație

SOBIS AP S.R.L. rulează un site WordPress (`sobis-ap.ro`). Pagina de cariere este o pagină HTML statică — **nu există API**. Scraperul folosește cheerio pentru a parsea HTML-ul paginii `https://sobis-ap.ro/cariere/`.

## Reguli (dacă există)

Verifică `robots.txt` la adresa: https://sobis-ap.ro/robots.txt

Dacă nu există `robots.txt`, nu există restricții.

## Interpretare

| Cale | Accesibil? | Ce conține |
|---|---|---|
| `/cariere/` | ✅ Da (HTML static) | Pagina de job-uri — sursa scraperului |
| `/robots.txt` | Verifică | Poate bloca crawleri |

## Recomandare

- Pagina `/cariere/` este HTML static și nu necesită autentificare.
- Scraperul face o singură cerere GET pentru a fetcha întreaga pagină HTML.
- Comportamentul este rezonabil — o singură cerere per rulare, fără paginare.

**Concluzie**: Risc minim. Pagina este publică, fără API intern, o singură cerere per rulare.
