#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
rhyme_finder.py – libreria per trovare rime in italiano

Funzionalità
~~~~~~~~~~~~
* rima perfetta (default) – stesso suffisso dell’input
* assonanza – suffisso composto solo da vocali
* consonanza – suffisso composto solo da consonanti
* **filtraggio opzionale per numero di sillabe**

Il risultato è ordinato dalla parola più corta alla più lunga (e, a parità,
alfabeticamente).  In console le parole vengono stampate una per riga.

Il modulo è utilizzabile sia da riga di comando (CLI) sia da altri script /
API.
"""

import argparse
import json
import sqlite3
import sys
import unicodedata
import re
from pathlib import Path
from typing import List, Optional

# ----------------------------------------------------------------------
# Costanti di supporto
# ----------------------------------------------------------------------
VOWEL = r"[aeiouàèéìíòóùúAEIOUÀÈÉÌÍÒÓÙÚ]"
# Dittonghi più comuni (sia aperti che chiusi)
DIPHTONGS = (
    "ai|au|ei|eu|oi|ou|ia|ie|io|iu|ua|ue|uo|ui|"
    "ei|èi|éi|òi|ói|ài|ái|èi|éi|òu|óu"
)
RE_DIPHTONG = re.compile(DIPHTONGS, re.IGNORECASE)
RE_VOWEL   = re.compile(VOWEL)

# ----------------------------------------------------------------------
# Utility di normalizzazione
# ----------------------------------------------------------------------
def _normalize(text: str) -> str:
    """Rimuove accenti e converte a minuscolo."""
    return (
        unicodedata.normalize("NFKD", text)
        .encode("ASCII", "ignore")
        .decode()
        .lower()
    )

# ----------------------------------------------------------------------
# Conteggio sillabe (euristico, ma affidabile per la maggior parte delle parole)
# ----------------------------------------------------------------------
def _count_syllables(word: str) -> int:
    """
    Stima il numero di sillabe di una parola italiana.
    Algoritmo:
        1. Conta tutte le vocali (nuclei vocalici grezzi).
        2. Sottrae 1 per ogni dittongo trovato (due vocali → un nucleo).
        3. Aggiunge 1 se trova tre vocali consecutive (es. “iai” → tre sillabe).
    """
    w = _normalize(word).strip().replace("-", "")
    if not w:
        return 0

    # 1️⃣  Numero grezzo di vocali
    nuclei = RE_VOWEL.findall(w)
    syllable_cnt = len(nuclei)

    # 2️⃣  Dittonghi → riducono di 1 il conteggio
    for _ in RE_DIPHTONG.finditer(w):
        syllable_cnt -= 1

    # 3️⃣  Tre vocali consecutive (trattici) → aggiungiamo 1
    if re.search(r"[aeiou]{3}", w):
        syllable_cnt += 1

    return max(syllable_cnt, 0)

# ----------------------------------------------------------------------
# Helper per costruire pattern LIKE specifici per assonanza / consonanza
# ----------------------------------------------------------------------
VOWEL_SET = set("aeiouàèéìíòóùúAEIOUÀÈÉÌÍÒÓÙÚ")

def _build_assonance_pattern(suffix: str) -> str:
    """
    Trasforma il suffisso in un pattern LIKE dove:
        - le vocali rimangono tali,
        - le consonanti diventano '_' (wildcard singolo).
    Esempio:  "esso" → "%e__o"
    """
    norm = _normalize(suffix)
    pattern_chars = [
        ch if ch in VOWEL_SET else "_" for ch in norm
    ]
    return "%" + "".join(pattern_chars)


def _build_consonance_pattern(suffix: str) -> str:
    """
    Trasforma il suffisso in un pattern LIKE dove:
        - le consonanti rimangono tali,
        - le vocali diventano '_' (wildcard singolo).
    Esempio:  "atto" → "%_tt_"
    """
    norm = _normalize(suffix)
    pattern_chars = [
        ch if ch not in VOWEL_SET else "_" for ch in norm
    ]
    return "%" + "".join(pattern_chars)

# ----------------------------------------------------------------------
# Funzioni di supporto per il DB
# ----------------------------------------------------------------------
def _build_like_pattern(suffix: str) -> str:
    """Pattern SQL per il suffisso richiesto."""
    return f"%{suffix}"

def _execute_query(db_path: Path, pattern: str) -> List[str]:
    """
    Esegue una SELECT con LIKE sul campo `testo`.
    Il pattern è già stato normalizzato (lowercase, senza accenti).
    """
    conn = sqlite3.connect(str(db_path))
    try:
        cur = conn.cursor()
        sql = """
            SELECT DISTINCT testo
            FROM parola
            WHERE LOWER(testo) LIKE ?
        """
        cur.execute(sql, (pattern,))
        rows = cur.fetchall()
        return [_normalize(row[0]) for row in rows]
    finally:
        conn.close()

def _filter_by_char_type(words: List[str], char_type: str) -> List[str]:
    """Mantiene solo parole il cui intero suffisso è solo vocali o solo consonanti."""
    allowed = set("aeiouàèéìíòóùú") if char_type == "vowel" else {
        chr(c) for c in range(0x00, 0x2000)
        if chr(c).isalpha() and chr(c).lower() not in "aeiouàèéìíòóùú"
    }

    def ok(word: str) -> bool:
        return all(ch in allowed for ch in word)

    return [w for w in words if ok(w)]

def _order_by_length(words: List[str]) -> List[str]:
    """Ordina prima per lunghezza (crescente), poi alfabeticamente."""
    return sorted(set(words), key=lambda w: (len(w), w))

def _exclude_exact_suffix(words: List[str], suffix: str) -> List[str]:
    """
    Rimuove dalla lista tutti i termini che terminano con lo stesso
    suffisso fornito dall’utente.  È utile per evitare che la parola di
    partenza compaia nei risultati (es. “are” → “are”).
    """
    norm_suffix = _normalize(suffix)
    return [w for w in words if not w.endswith(norm_suffix)]

# ----------------------------------------------------------------------
# API principale
# ----------------------------------------------------------------------
def find_rhymes(
    suffix_input: str,
    rhyme_type: str = "perfect",               # perfect | assonance | consonance
    syllable_target: Optional[int] = None,    # None → nessun filtro
    db_path: Path = Path("morph_it_parole.db"),
) -> List[str]:
    """
    Restituisce le parole che rimano con ``suffix_input`` secondo il tipo
    richiesto e, opzionalmente, con il numero di sillabe indicato.
    Le parole il cui suffisso è identico a ``suffix_input`` vengono
    escluse dal risultato.
    """
    suffix = _normalize(suffix_input)
    if not suffix:
        raise ValueError("Il suffisso di ricerca non può essere vuoto.")

    # ------------------------------------------------------------------
    # Scelta del pattern LIKE in base al tipo di rima
    # ------------------------------------------------------------------
    if rhyme_type == "perfect":
        pattern = _build_like_pattern(suffix)            # %suffix
    elif rhyme_type == "assonance":
        pattern = _build_assonance_pattern(suffix)       # %e__o, %a_i_, …
    elif rhyme_type == "consonance":
        pattern = _build_consonance_pattern(suffix)      # %_tt_, %b_n_, …
    else:
        raise ValueError(
            "Tipo di rima non riconosciuto. Usa 'perfect', 'assonance' o 'consonance'."
        )

    # ------------------------------------------------------------------
    # Recupero dal DB
    # ------------------------------------------------------------------
    candidates = _execute_query(db_path, pattern)

    # ------------------------------------------------------------------
    # Escludi parole con lo stesso suffisso dell’input
    # ------------------------------------------------------------------
    if rhyme_type != "perfect":
        candidates = _exclude_exact_suffix(candidates, suffix)

    # ------------------------------------------------------------------
    # Eventuale filtro per numero di sillabe
    # ------------------------------------------------------------------
    if syllable_target is not None:
        candidates = [
            w for w in candidates if _count_syllables(w) == syllable_target
        ]

    # ------------------------------------------------------------------
    # Ordinamento finale (lunghezza crescente, poi alfabetico)
    # ------------------------------------------------------------------
    return _order_by_length(candidates)

# ----------------------------------------------------------------------
# Interfaccia a riga di comando
# ----------------------------------------------------------------------
def _cli() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Cerca parole che rimano con un dato suffisso usando il DB di Morph‑IT. "
            "Opzioni: tipo di rima (default: perfect) e filtro per numero di sillabe."
        )
    )
    parser.add_argument("suffix", help="Suffisso di partenza (es. 'are', 'zione').")
    parser.add_argument(
        "--type",
        choices=["perfect", "assonance", "consonance"],
        default="perfect",
        help="Tipo di rima da cercare (default: perfect).",
    )
    parser.add_argument(
        "--syllables",
        type=int,
        metavar="N",
        help="Filtra le parole restituite mantenendo solo quelle con N sillabe.",
    )
    parser.add_argument(
        "--db",
        default="morph_it_parole.db",
        help="Percorso al file SQLite (default: morph_it_parole.db).",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Stampa l'output in JSON (utile per API).",
    )
    args = parser.parse_args()

    try:
        results = find_rhymes(
            suffix_input=args.suffix,
            rhyme_type=args.type,
            syllable_target=args.syllables,
            db_path=Path(args.db),
        )
    except Exception as exc:
        sys.stderr.write(f"Errore: {exc}\n")
        sys.exit(1)

    if args.json:
        payload = {
            "suffix": args.suffix,
            "type": args.type,
            "syllable_filter": args.syllables,
            "results": results,
        }
        print(json.dumps(payload, ensure_ascii=False, indent=2))
    else:
        header = f"\nRIME {args.type.upper()} per il suffisso '{args.suffix}'"
        if args.syllables is not None:
            header += f" con {args.syllables} sillabe"
        print(header + ":")
        if results:
            for w in results:
                print(w)
        else:
            print("(nessuna corrispondenza)")

if __name__ == "__main__":
    _cli()
