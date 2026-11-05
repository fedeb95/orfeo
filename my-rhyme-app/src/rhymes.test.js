import { describe, expect, test } from "vitest";
import { buildDictionary, countSyllables, findRhymes, normalize } from "./rhymes";

describe("normalize", () => {
  test("rimuove accenti e maiuscole", () => {
    expect(normalize("Città")).toBe("citta");
    expect(normalize("perché")).toBe("perche");
  });
});

describe("countSyllables", () => {
  test.each([
    ["mare", 2],
    ["città", 2],
    ["guerra", 2],
    ["chiesa", 2],
    ["poeta", 3],
    ["aereo", 4],
    ["idea", 3],
    ["ciao", 2],
    ["gioia", 2],
    ["noia", 2],
    ["figlia", 2],
    ["scienza", 2],
    ["aiuola", 3],
    ["aiuto", 3],
    ["maiale", 3],
    ["cuoio", 2],
    ["buoi", 1],
    ["miei", 1],
    ["più", 1],
    ["guida", 2],
    ["uomo", 2],
    ["cuore", 2],
    ["europa", 3],
    ["precipitevolissimevolmente", 11],
  ])("%s → %i", (word, expected) => {
    expect(countSyllables(word)).toBe(expected);
  });
});

describe("findRhymes", () => {
  const dict = buildDictionary(
    ["amore", "cuore", "fiore", "dolore", "sole", "mare", "ore", "core", "pane", "città", "metà", "fata", "rete"].join(
      "\n"
    )
  );

  test("rima perfetta, ignorando gli accenti, ordinata per lunghezza", () => {
    expect(findRhymes(dict, { suffix: "ore" })).toEqual(["ore", "core", "amore", "cuore", "fiore", "dolore"]);
    expect(findRhymes(dict, { suffix: "ta" })).toEqual(["fata", "metà", "città"]);
  });

  test("assonanza: stesse vocali, consonanti diverse", () => {
    expect(findRhymes(dict, { suffix: "ore", type: "assonance" })).toEqual(["sole"]);
  });

  test("consonanza: stesse consonanti, vocali diverse", () => {
    expect(findRhymes(dict, { suffix: "ore", type: "consonance" })).toEqual(["mare"]);
  });

  test("filtro per sillabe", () => {
    expect(findRhymes(dict, { suffix: "ore", syllables: 2 })).toEqual(["ore", "core", "cuore", "fiore"]);
  });

  test("i caratteri speciali nel suffisso non sono jolly", () => {
    expect(findRhymes(dict, { suffix: "o.e", type: "assonance" })).toEqual([]);
    expect(findRhymes(dict, { suffix: "o_e" })).toEqual([]);
  });

  test("suffisso vuoto → nessun risultato", () => {
    expect(findRhymes(dict, { suffix: "  " })).toEqual([]);
  });
});
