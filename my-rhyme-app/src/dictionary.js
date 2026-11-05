import { useEffect, useState } from "react";
import { buildDictionary } from "./rhymes";

let pending = null;

function loadDictionary() {
  pending ??= fetch(`${import.meta.env.BASE_URL}words.txt`)
    .then((resp) => {
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      return resp.text();
    })
    .then(buildDictionary)
    .catch((err) => {
      pending = null; // permette di riprovare
      throw err;
    });
  return pending;
}

/** Scarica e prepara il dizionario una sola volta. */
export function useDictionary() {
  const [state, setState] = useState({ dict: null, error: null });

  useEffect(() => {
    let active = true;
    loadDictionary().then(
      (dict) => active && setState({ dict, error: null }),
      (error) => active && setState({ dict: null, error })
    );
    return () => {
      active = false;
    };
  }, []);

  return state;
}
