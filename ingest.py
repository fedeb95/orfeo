#!/usr/bin/env python3
"""
Genera l'elenco di parole usato dal sito statico a partire da Morph-it.

Legge la prima colonna (forma flessa) del file Morph-it, che è codificato
in Latin-1, e scrive in `my-rhyme-app/public/words.txt` una parola per riga:
- solo forme composte da lettere (niente punteggiatura, numeri, sigle con
  punti o forme con apostrofo come "citta'", che hanno già una variante
  accentata);
- in minuscolo, senza duplicati, ordinate.

Nessuna dipendenza esterna: basta Python 3.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "morphit" / "current_version" / "morph-it_048.txt"
OUTPUT = ROOT / "my-rhyme-app" / "public" / "words.txt"

WORD_RE = re.compile(r"[a-zàáèéìíîïòóôùú]+")


def main() -> int:
    words = set()
    with SOURCE.open("r", encoding="latin-1") as f:
        for line in f:
            form = line.split("\t", 1)[0].strip().lower()
            if WORD_RE.fullmatch(form):
                words.add(form)

    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text("\n".join(sorted(words)) + "\n", encoding="utf-8")
    print(f"{len(words):,} parole scritte in {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
