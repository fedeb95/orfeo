import { useDeferredValue, useMemo, useState } from "react";
import Results from "./components/Results";
import { useDictionary } from "./dictionary";
import { findRhymes, normalize } from "./rhymes";

const TYPES = [
  ["perfect", "Perfetta"],
  ["assonance", "Assonanza"],
  ["consonance", "Consonanza"],
];

export default function App() {
  const { dict, error } = useDictionary();
  const [suffix, setSuffix] = useState("ore");
  const [type, setType] = useState("perfect");
  const [syllables, setSyllables] = useState("");

  // La ricerca parte mentre si scrive; il valore differito tiene reattivo il campo.
  const clean = normalize(useDeferredValue(suffix).trim());
  const results = useMemo(
    () =>
      dict && clean ? findRhymes(dict, { suffix: clean, type, syllables: syllables ? Number(syllables) : null }) : null,
    [dict, clean, type, syllables]
  );

  return (
    <>
      <header>
        <h1>
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width="28" height="28" />
          <span>
            Orfeo <small>cerca rime italiane</small>
          </span>
        </h1>

        {/* Su telefono, Invio chiude la tastiera per mostrare i risultati. */}
        <form role="search" onSubmit={(e) => (e.preventDefault(), document.activeElement.blur())}>
          <label htmlFor="suffix">Parole che finiscono in</label>
          <input
            id="suffix"
            type="search"
            value={suffix}
            onChange={(e) => setSuffix(e.target.value)}
            placeholder="es. ore"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck="false"
            enterKeyHint="search"
          />

          <div className="filters">
            <fieldset>
              <legend>Tipo di rima</legend>
              {TYPES.map(([value, label]) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="type"
                    value={value}
                    checked={type === value}
                    onChange={() => setType(value)}
                  />
                  {label}
                </label>
              ))}
            </fieldset>

            <label>
              Sillabe{" "}
              <select value={syllables} onChange={(e) => setSyllables(e.target.value)}>
                <option value="">tutte</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </form>
      </header>

      <main>
        <p className="status" role="status">
          {error
            ? `Il dizionario non si è caricato (${error.message}). Ricarica la pagina per riprovare.`
            : !dict
              ? "Caricamento del dizionario…"
              : !clean
                ? "Scrivi la parte finale di una parola, per esempio “ore” o “ezza”."
                : results.length === 0
                  ? `Nessuna parola in -${clean}.`
                  : `${results.length.toLocaleString("it-IT")} ${results.length === 1 ? "parola" : "parole"} in -${clean}`}
        </p>

        {results?.length > 0 && (
          <Results key={`${clean}|${type}|${syllables}`} words={results} suffixLength={clean.length} />
        )}
      </main>

      <footer>
        <details>
          <summary>Come funziona</summary>
          <p>
            <b>Perfetta</b>: stessa terminazione. <b>Assonanza</b>: stesse vocali, consonanti diverse.{" "}
            <b>Consonanza</b>: stesse consonanti, vocali diverse. Gli accenti sono ignorati. Le sillabe sono contate con
            regole approssimate e possono sbagliare con gli iati (pa-u-ra).
          </p>
        </details>
        <p>
          Dizionario <a href="https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it">Morph-it!</a> di Marco Baroni
          ed Eros Zanchetta (CC BY-SA 2.0 / LGPL). <a href="https://github.com/fedeb95/orfeo">Codice sorgente</a> (MIT).
        </p>
      </footer>
    </>
  );
}
