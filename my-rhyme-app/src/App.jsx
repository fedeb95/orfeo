// src/App.jsx
import React, { useState, useCallback } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import Pagination from "./components/Pagination";
import { fetchRhymes } from "./api";

export default function App() {
  const [queryParams, setQueryParams] = useState(null); // parametri correnti
  const [data, setData] = useState(null);              // risposta JSON
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Funzione centrale per effettuare la chiamata API
  const loadData = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchRhymes(params);
        setData(resp);
        setQueryParams(params); // ricordiamo i parametri usati
      } catch (err) {
        setError(err);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Invocata dal form di ricerca
  const handleSearch = (params) => {
    loadData(params);
  };

  // Invocata dai pulsanti di paginazione
  const handlePageChange = (newPage) => {
    if (!queryParams) return;
    const newParams = { ...queryParams, page: newPage };
    loadData(newParams);
  };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "1rem" }}>
      <h1>Trova rime</h1>

      <SearchForm onSearch={handleSearch} />

      <Results data={data} loading={loading} error={error} />

      {data && (
        <Pagination
          page={data.page}
          totalPages={data.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
