# --------------------------------------------------------------
# file: app.py
# --------------------------------------------------------------
"""
Flask API per la ricerca di rime italiane.

Il percorso del database è letto da un file di configurazione
(esterno al codice) – `config.yaml` o `config.json`.
"""

from pathlib import Path
from typing import Optional, Any, Dict

from flask import Flask, jsonify, request, abort
from flask_cors import CORS

import yaml          # pip install pyyaml   (opzionale, solo per YAML)
import json

from math import ceil   # per calcolare il numero totale di pagine (opzionale)

# ----------------------------------------------------------------------
# 1️⃣ Caricamento della configurazione
# ----------------------------------------------------------------------
DEFAULT_CONFIG_PATH = Path("config.yaml")  # può essere .json, .yaml o .yml

def _load_config(config_path: Path = DEFAULT_CONFIG_PATH) -> Dict[str, Any]:
    """
    Legge il file di configurazione. Se il file non esiste o il parsing
    fallisce, restituisce un dizionario vuoto (viene usato il fallback).
    """
    if not config_path.exists():
        # Proviamo con .json se .yaml non è presente
        alt_json = config_path.with_suffix(".json")
        if alt_json.exists():
            config_path = alt_json
        else:
            return {}  # nessun file di config → fallback

    try:
        if config_path.suffix.lower() in {".yaml", ".yml"}:
            # yaml.safe_load restituisce dict o None
            with config_path.open("rt", encoding="utf-8") as f:
                return yaml.safe_load(f) or {}
        elif config_path.suffix.lower() == ".json":
            with config_path.open("rt", encoding="utf-8") as f:
                return json.load(f)
    except Exception as exc:
        # In caso di errore di parsing, logghiamo (stdout) e continuiamo
        print(f"[WARN] Impossibile caricare config da {config_path}: {exc}")
    return {}

CONFIG = _load_config()

# Helper per estrarre valori con fallback
def _cfg(section: str, key: str, default: Any) -> Any:
    return CONFIG.get(section, {}).get(key, default)

# Percorso del DB (fallback a ./morph_it_parole.db)
DB_DEFAULT = Path("./morph_it_parole.db")
DB_PATH: Path = Path(_cfg("database", "path", str(DB_DEFAULT))).expanduser().resolve()

# ----------------------------------------------------------------------
# Helper per parametri interi con valore di default
# ----------------------------------------------------------------------
def _parse_positive_int(value: str, default: int) -> int:
    """Restituisce un int > 0 oppure il valore di default."""
    try:
        iv = int(value)
        return iv if iv > 0 else default
    except (TypeError, ValueError):
        return default

# ----------------------------------------------------------------------
# 2️⃣ Import della logica di ricerca
# ----------------------------------------------------------------------
from rhyme_finder import find_rhymes

# ----------------------------------------------------------------------
# 3️⃣ Creazione dell’app Flask
# ----------------------------------------------------------------------
app = Flask(__name__)
CORS(app, resources={r"/rhyme*": {"origins": "*"}})

# ----------------------------------------------------------------------
# 4️⃣ Helper per conversione interi (syllables)
# ----------------------------------------------------------------------
def _parse_int(param: str) -> Optional[int]:
    try:
        return int(param)
    except (TypeError, ValueError):
        return None

# ----------------------------------------------------------------------
# 5️⃣ Rotte
# ----------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    """Endpoint di controllo rapido."""
    return jsonify({"status": "ok"})


# ----------------------------------------------------------------------
# Endpoint /rhyme (aggiornato)
# ----------------------------------------------------------------------
@app.route("/rhyme", methods=["GET"])
def rhyme():
    """
    Restituisce le rime in formato JSON con supporto a paginazione.
    Query‑string:
        suffix      – suffisso di partenza (obbligatorio)
        type        – perfect | assonance | consonance (default: perfect)
        syllables   – intero opzionale per filtrare per numero di sillabe
        limit       – max risultati da restituire (default: 50)
        page        – pagina da visualizzare (default: 1)
    """
    # ------------------- 1️⃣ Parametri obbligatori -------------------
    suffix = request.args.get("suffix")
    if not suffix:
        abort(400, description="Parametro 'suffix' obbligatorio.")

    # ------------------- 2️⃣ Parametri opzionali --------------------
    rhyme_type = request.args.get("type", "perfect").lower()
    if rhyme_type not in {"perfect", "assonance", "consonance"}:
        abort(400, description="Tipo di rima non valido.")

    syllables_raw = request.args.get("syllables")
    syllables = _parse_int(syllables_raw) if syllables_raw is not None else None

    # Paginazione
    limit = _parse_positive_int(request.args.get("limit"), default=50)
    page  = _parse_positive_int(request.args.get("page"),  default=1)

    # ------------------- 3️⃣ Ricerca -------------------------------
    try:
        all_matches = find_rhymes(
            suffix_input=suffix,
            rhyme_type=rhyme_type,
            syllable_target=syllables,
            db_path=DB_PATH,
        )
    except Exception as exc:
        abort(500, description=str(exc))

    total_matches = len(all_matches)

    # Calcoliamo gli indici della slice da restituire
    start_idx = (page - 1) * limit
    end_idx   = start_idx + limit
    page_items = all_matches[start_idx:end_idx]

    # ------------------- 4️⃣ Costruzione risposta -------------------
    payload = {
        "suffix": suffix,
        "type": rhyme_type,
        "syllable_filter": syllables,
        "db_path_used": str(DB_PATH),
        "total_matches": total_matches,
        "limit": limit,
        "page": page,
        "results": page_items,
        "count": len(page_items),
    }

    # Facoltativo: includere il numero totale di pagine (utile per UI)
    if total_matches:
        payload["total_pages"] = ceil(total_matches / limit)

    return jsonify(payload)

# ----------------------------------------------------------------------
# 6️⃣ Avvio del server (solo se eseguito direttamente)
# ----------------------------------------------------------------------
if __name__ == "__main__":
    host = _cfg("server", "host", "0.0.0.0")
    port = _cfg("server", "port", 5000)
    debug = _cfg("server", "debug", True)

    # In produzione è consigliato usare gunicorn/uwsgi dietro un reverse proxy.
    app.run(host=host, port=port, debug=debug)
