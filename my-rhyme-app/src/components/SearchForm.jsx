// src/components/SearchForm.jsx
import React, { useState } from "react";

export default function SearchForm({ onSearch }) {
  const [suffix, setSuffix] = useState("");
  const [type, setType] = useState("perfect");
  const [syllables, setSyllables] = useState("");
  const [limit, setLimit] = useState(50);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Costruiamo l'oggetto dei parametri da passare al genitore
    const params = {
      suffix: suffix.trim(),
      type,
      limit: Number(limit) || 50,
      page: 1,                     // reset a pagina 1 ad ogni nuova ricerca
    };
    if (syllables) params.syllables = Number(syllables);
    onSearch(params);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <label>
        Suffisso:&nbsp;
        <input
          type="text"
          value={suffix}
          onChange={(e) => setSuffix(e.target.value)}
          required
        />
      </label>

      &nbsp;&nbsp;

      <label>
        Tipo:&nbsp;
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="perfect">Perfetta</option>
          <option value="assonance">Assonanza</option>
          <option value="consonance">Consonanza</option>
        </select>
      </label>

      &nbsp;&nbsp;

      <label>
        Sillabe (facoltativo):&nbsp;
        <input
          type="number"
          min="1"
          value={syllables}
          onChange={(e) => setSyllables(e.target.value)}
          placeholder="es. 3"
        />
      </label>

      &nbsp;&nbsp;

      <label>
        Limite per pagina:&nbsp;
        <input
          type="number"
          min="1"
          max="200"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
        />
      </label>

      &nbsp;&nbsp;

      <button type="submit">Cerca</button>
    </form>
  );
}
