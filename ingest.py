#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
morph_it_to_sqlite.py
---------------------

Legge il file Morph‑IT.tsv, estrae la forma testuale della parola
(e la prima colonna) e la inserisce in una tabella SQLite `parola(testo)`.

Caratteristiche aggiunte rispetto alla versione base:
* Gestione sicura di errori di codifica (UnicodeDecodeError, byte‑invalidi).
* Log degli errori in `morph_it_errors.log` con timestamp e numero di riga.
* L'elaborazione continua anche se una riga è corrotta.
"""

import os
import sqlite3
import csv
import logging
from pathlib import Path
from datetime import datetime

# ----------------------------------------------------------------------
# CONFIGURAZIONE --------------------------------------------------------
# ----------------------------------------------------------------------
MORPH_IT_PATH = Path("morphit/current_version/morph-it_048.txt")          # <‑‑ modifica se necessario
DB_PATH        = Path("parole.db")
TABLE_NAME     = "parola"
COLUMN_NAME    = "testo"

# File di log (viene creato nella stessa cartella dello script)
LOG_FILE = Path("morph_it_errors.log")

# ----------------------------------------------------------------------
# LOGGING SETUP ---------------------------------------------------------
# ----------------------------------------------------------------------
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.ERROR,
    format="%(asctime)s | %(levelname)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)

def log_error(msg: str):
    """Utility per scrivere un messaggio di errore sia sul log che a console."""
    logging.error(msg)
    print(f"⚠️  {msg}")

# ----------------------------------------------------------------------
# FUNZIONI DATABASE -----------------------------------------------------
# ----------------------------------------------------------------------
def crea_tabella(conn: sqlite3.Connection) -> None:
    """Crea la tabella `parola(testo TEXT PRIMARY KEY)` se non esiste."""
    cur = conn.cursor()
    cur.execute(
        f"""
        CREATE TABLE IF NOT EXISTS {TABLE_NAME} (
            {COLUMN_NAME} TEXT PRIMARY KEY
        );
        """
    )
    conn.commit()


def inserisci_parola(conn: sqlite3.Connection, parola: str) -> None:
    """Inserisce una parola usando INSERT OR IGNORE (ignora duplicati)."""
    cur = conn.cursor()
    cur.execute(
        f"INSERT OR IGNORE INTO {TABLE_NAME} ({COLUMN_NAME}) VALUES (?)",
        (parola,),
    )

# ----------------------------------------------------------------------
# ELABORAZIONE MORPH‑IT -----------------------------------------------
# ----------------------------------------------------------------------
def processa_morph_it(file_path: Path, db_path: Path) -> None:
    """Legge il TSV, gestisce errori di codifica e popola il DB."""
    if not file_path.is_file():
        raise FileNotFoundError(f"Impossibile trovare il file: {file_path}")

    # Connessione al DB (crea il file se non esiste)
    conn = sqlite3.connect(db_path)
    try:
        crea_tabella(conn)

        # Apertura del file con gestione robusta dei codec
        # `errors="replace"` sostituisce i byte non validi con � (U+FFFD)
        # così il parser non si blocca.
        with file_path.open("r", encoding="utf-8", errors="replace") as f:
            # Conta le righe per la barra di avanzamento (se tqdm è disponibile)
            total = sum(1 for _ in f)
            f.seek(0)

            # Prepariamo l'iteratore (con tqdm se installato)
            try:
                from tqdm import tqdm
                iterator = tqdm(csv.reader(f, delimiter="\t"),
                                total=total,
                                desc="Importando parole")
            except ImportError:
                iterator = csv.reader(f, delimiter="\t")

            for line_no, row in enumerate(iterator, start=1):
                try:
                    # Saltiamo righe vuote
                    if not row:
                        continue

                    # La prima colonna è la forma testuale della parola
                    parola = row[0].strip()

                    # Se la colonna è vuota, registriamo un warning ma continuiamo
                    if not parola:
                        log_error(f"Riga {line_no}: colonna vuota – riga ignorata.")
                        continue

                    # Inserimento sicuro
                    inserisci_parola(conn, parola)

                except Exception as e:
                    # Qualsiasi eccezione legata a questa riga viene loggata
                    log_error(f"Riga {line_no}: eccezione inattesa → {e!r}")

        conn.commit()
        print("\n✅  Importazione completata.")
        print(f"   • Righe totali analizzate : {total:,}")
        print(f"   • Database creato         : {db_path.resolve()}")
        print(f"   • Eventuali errori sono stati salvati in '{LOG_FILE.name}'.")
    finally:
        conn.close()


# ----------------------------------------------------------------------
# MAIN ------------------------------------------------------------------
# ----------------------------------------------------------------------
if __name__ == "__main__":
    try:
        processa_morph_it(MORPH_IT_PATH, DB_PATH)
    except Exception as exc:
        log_error(f"Errore fatale durante l'esecuzione: {exc!r}")
