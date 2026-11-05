# Orfeo

Cerca rime italiane per suffisso: rime perfette, assonanze e consonanze, raggruppate per numero di sillabe.

È un sito interamente statico: il dizionario (~400.000 forme flesse, ~1 MB compresso) viene scaricato una volta e la ricerca avviene nel browser.

## Come funziona

- `ingest.py` legge [Morph-it!](https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it) (`morphit/`) e genera `my-rhyme-app/public/words.txt`, una parola per riga.
- `my-rhyme-app/src/rhymes.js` contiene la logica di ricerca e il conteggio euristico delle sillabe.
- `my-rhyme-app/` è il frontend React, costruito con Vite.

## Sviluppo

Requisiti: Python 3, Node.js ≥ 20.19.

```sh
python3 ingest.py          # genera il dizionario
cd my-rhyme-app
npm install
npm run dev                # http://localhost:5173
npm test                   # test della logica di ricerca
npm run build              # build statica in dist/
```

## Deploy

A ogni push su `main`, la workflow `.github/workflows/deploy.yml` genera il dizionario, esegue i test, costruisce il sito e lo pubblica su GitHub Pages.

Una tantum, su GitHub: *Settings → Pages → Build and deployment → Source: GitHub Actions*.

## Licenze

Il codice è distribuito con licenza MIT (vedi `LICENSE`).

Il dizionario deriva da Morph-it! di Marco Baroni ed Eros Zanchetta, distribuito con licenza CC BY-SA 2.0 / LGPL; il file `words.txt` generato è soggetto alla stessa licenza.
