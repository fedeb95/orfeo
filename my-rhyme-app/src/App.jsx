// src/App.jsx
import React, { useState, useCallback } from "react";
import { Container, Paper, Typography, CssBaseline } from "@mui/material";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import Pagination from "./components/Pagination";
import { fetchRhymes } from "./api";
import { Snackbar, Alert, Box } from "@mui/material";
import { useEffect } from "react";

export default function App() {
  const [queryParams, setQueryParams] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(
    async (params) => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchRhymes(params);
        setData(resp);
        setQueryParams(params);
      } catch (e) {
        setError(e);
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSearch = (params) => loadData(params);
  const handlePageChange = (newPage) => {
    if (!queryParams) return;
    loadData({ ...queryParams, page: newPage });
  };

    const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });

    useEffect(() => {
      if (error) {
        setSnack({
          open: true,
          message: error.message || "Errore nella richiesta",
          severity: "error",
        });
      }
    }, [error]);

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
            Trova rime
          </Typography>
          <Typography component="p" gutterBottom align="left" sx={{ mb: 2 }}>
            Ricerca di rime per suffisso. 
            Sono rime perfette tutte le parole con identico suffisso, ignorando gli accenti.
            Per contare le sillabe viene applicata un'euristica, per cui il filtro "Sillabe" potrebbe dare risultati inesatti.
          </Typography>

          <SearchForm onSearch={handleSearch} />

          <Results data={data} loading={loading} error={error} />

          {data && (
            <Pagination
              page={data.page}
              totalPages={data.total_pages}
              onPageChange={handlePageChange}
            />
          )}
        </Paper>
      </Container>
         <Snackbar
          open={snack.open}
          autoHideDuration={4000}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snack.severity} sx={{ width: "100%" }}>
            {snack.message}
          </Alert>
        </Snackbar>
    </>
  );
}
