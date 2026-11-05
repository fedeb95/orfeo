// Logica di ricerca delle rime, eseguita interamente nel browser.

const VOWELS = "aeiou";
const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
const ANY_VOWEL = "aeiouàáèéìíîïòóôùú";
// Vocali "forti": a, e, o e qualsiasi vocale accentata (un accento su i/u
// segnala che la vocale è tonica, quindi forma un nucleo a sé).
const STRONG_VOWELS = "aeoàáèéìíîïòóôùú";

const collator = new Intl.Collator("it");

/** Minuscolo e senza accenti: "Città" → "citta". */
export function normalize(text) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Stima euristica del numero di sillabe di una parola italiana.
 *
 * 1. Toglie la "i" diacritica di ci/gi/sci/gli davanti a vocale
 *    (cia, gio, scia, glia), che non forma sillaba.
 * 2. Divide la parola in gruppi di vocali consecutive.
 * 3. In ogni gruppo, una i/u preceduta da vocale forte e seguita da vocale
 *    inizia un nuovo nucleo (a-iuo-la, no-ia, ma-ia-le).
 * 4. Ogni pezzo vale tante sillabe quante sono le sue vocali forti
 *    (po-e-ta, a-e-re-o), oppure una se ne ha nessuna (gui-da, più).
 *
 * Limite noto: lo iato con i/u tonica non accentata nella grafia
 * (pa-u-ra, far-ma-ci-a, po-e-si-a) non è riconoscibile senza conoscere
 * l'accento, quindi viene contato come dittongo.
 */
export function countSyllables(word) {
  const w = word
    .toLowerCase()
    .replace(new RegExp(`([cg]|gl)i(?=[${ANY_VOWEL}])`, "g"), "$1");

  let count = 0;
  for (const [group] of w.matchAll(new RegExp(`[${ANY_VOWEL}]+`, "g"))) {
    let chunkStrong = 0;
    for (let k = 0; k < group.length; k++) {
      const ch = group[k];
      const startsNucleus =
        k > 0 &&
        k < group.length - 1 &&
        (ch === "i" || ch === "u") &&
        STRONG_VOWELS.includes(group[k - 1]);
      if (startsNucleus) {
        count += Math.max(chunkStrong, 1);
        chunkStrong = 0;
      }
      if (STRONG_VOWELS.includes(ch)) chunkStrong++;
    }
    count += Math.max(chunkStrong, 1);
  }
  return count;
}

/** Prepara il dizionario a partire dal testo di words.txt (una parola per riga). */
export function buildDictionary(text) {
  const words = text.split("\n").filter(Boolean);
  return { words, normalized: words.map(normalize) };
}

function suffixMatcher(suffix, type) {
  if (type === "perfect") return (w) => w.endsWith(suffix);

  // Assonanza: vocali fisse, ogni consonante → una consonante qualsiasi.
  // Consonanza: consonanti fisse, ogni vocale → una vocale qualsiasi.
  const [fixed, wildcard] =
    type === "assonance" ? [VOWELS, CONSONANTS] : [CONSONANTS, VOWELS];
  const pattern = [...suffix]
    .map((ch) =>
      fixed.includes(ch) || !wildcard.includes(ch) ? escapeRegExp(ch) : `[${wildcard}]`
    )
    .join("");
  const re = new RegExp(`${pattern}$`);
  // Le parole con lo stesso identico suffisso sono rime perfette: le escludiamo.
  return (w) => re.test(w) && !w.endsWith(suffix);
}

/**
 * Cerca le parole che rimano con `suffix`.
 * @param {{words: string[], normalized: string[]}} dict
 * @param {{suffix: string, type?: "perfect"|"assonance"|"consonance", syllables?: number|null}} query
 * @returns {string[]} parole ordinate per lunghezza, poi alfabeticamente
 */
export function findRhymes(dict, { suffix, type = "perfect", syllables = null }) {
  const s = normalize(suffix.trim());
  if (!s) return [];
  if (!["perfect", "assonance", "consonance"].includes(type)) {
    throw new Error(`Tipo di rima non valido: ${type}`);
  }

  const matches = suffixMatcher(s, type);
  const results = [];
  for (let i = 0; i < dict.words.length; i++) {
    if (!matches(dict.normalized[i])) continue;
    const word = dict.words[i];
    if (syllables != null && countSyllables(word) !== syllables) continue;
    results.push(word);
  }
  return results.sort((a, b) => a.length - b.length || collator.compare(a, b));
}
