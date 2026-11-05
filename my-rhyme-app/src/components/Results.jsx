import { useMemo, useState } from "react";
import { groupBySyllables } from "../rhymes";

const STEP = 300;

export default function Results({ words, suffixLength }) {
  const [visible, setVisible] = useState(STEP);

  // Tronca prima di raggruppare, così la pagina resta leggera anche con decine di migliaia di risultati.
  const groups = useMemo(() => {
    let left = visible;
    const shown = [];
    for (const [n, list] of groupBySyllables(words)) {
      if (left <= 0) break;
      shown.push([n, list.slice(0, left), list.length]);
      left -= list.length;
    }
    return shown;
  }, [words, visible]);

  return (
    <>
      {groups.map(([n, list, total]) => (
        <section key={n}>
          <h2>
            {n} {n === 1 ? "sillaba" : "sillabe"} <small>{total.toLocaleString("it-IT")}</small>
          </h2>
          <ul>
            {list.map((w) => {
              const cut = w.length - suffixLength;
              return (
                <li key={w}>
                  {w.slice(0, cut)}
                  <mark>{w.slice(cut)}</mark>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {visible < words.length && (
        <button type="button" onClick={() => setVisible((v) => v + STEP * 3)}>
          Mostra altre parole
        </button>
      )}
    </>
  );
}
