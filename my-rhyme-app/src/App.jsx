import { useMemo, useState } from "react";
import { Alert, Box, Container, CssBaseline, LinearProgress, Link, Paper, Typography } from "@mui/material";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";
import Pagination from "./components/Pagination";
import { useDictionary } from "./dictionary";
import { findRhymes } from "./rhymes";

export default function App() {
  const { dict, error } = useDictionary();
  const [query, setQuery] = useState(null);
  const [page, setPage] = useState(1);

  const results = useMemo(() => (dict && query ? findRhymes(dict, query) : null), [dict, query]);
  const totalPages = results ? Math.max(1, Math.ceil(results.length / query.limit)) : 0;
  const pageItems = results ? results.slice((page - 1) * query.limit, page * query.limit) : [];

  const handleSearch = (params) => {
    setQuery(params);
    setPage(1);
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 2 }}>
            Trova rime
          </Typography>
          <Typography sx={{ mb: 2 }}>
            Ricerca di rime per suffisso. Sono rime perfette tutte le parole con identico suffisso, ignorando gli
            accenti. Per contare le sillabe viene applicata un'euristica, per cui il filtro "Sillabe" potrebbe dare
            risultati inesatti.
          </Typography>

          <SearchForm onSearch={handleSearch} disabled={!dict} />

          {!dict && !error && (
            <Box sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Caricamento del dizionario…
              </Typography>
              <LinearProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ my: 2 }}>
              Impossibile caricare il dizionario ({error.message}). Ricarica la pagina per riprovare.
            </Alert>
          )}

          {results && (
            <>
              <Results items={pageItems} total={results.length} page={page} totalPages={totalPages} />
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </Paper>

        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 3 }}>
          Dizionario:{" "}
          <Link href="https://docs.sslmit.unibo.it/doku.php?id=resources:morph-it" target="_blank" rel="noopener">
            Morph-it!
          </Link>{" "}
          di Marco Baroni e Eros Zanchetta, distribuito con licenza CC BY-SA 2.0 / LGPL.
        </Typography>
      </Container>
    </>
  );
}
