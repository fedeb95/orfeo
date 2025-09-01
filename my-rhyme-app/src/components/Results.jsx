// src/components/Results.jsx
import React from "react";

export default function Results({ data, loading, error }) {
  if (loading) return <p>Caricamento…</p>;
  if (error) return <p style={{ color: "red" }}>Errore: {error.message}</p>;

  if (!data) return null; // nessuna ricerca ancora

  const { results, total_matches, limit, page, total_pages } = data;

  return (
    <div>
      <p>
        <strong>{total_matches}</strong> parole trovate. Mostrando pagina{" "}
        <strong>{page}</strong> di <strong>{total_pages}</strong>.
      </p>

      {results.length === 0 ? (
        <p>(Nessuna corrispondenza per i criteri scelti)</p>
      ) : (
        <ul>
          {results.map((word, idx) => (
            <li key={idx}>{word}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
