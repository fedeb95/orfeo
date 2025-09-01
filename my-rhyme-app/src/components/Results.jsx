// src/components/Results.jsx
import React from "react";
import Grow from "@mui/material/Grow";
import {
  Box,
  Typography,
  List,
  ListItem,
  CircularProgress,
  Alert,
} from "@mui/material";

export default function Results({ data, loading, error }) {
  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
        <CircularProgress />
      </Box>
    );

  if (error)
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error.message || "Si è verificato un errore"}
      </Alert>
    );

  if (!data) return null;

  const { results, total_matches, limit, page, total_pages } = data;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        <strong>{total_matches}</strong> parole trovate – pagina <strong>
          {page}
        </strong> di <strong>{total_pages}</strong>
      </Typography>

     {results.length === 0 ? (
          <Typography>(Nessuna corrispondenza…)</Typography>
        ) : (
          <Grow in={true} timeout={500}>
            <List dense>
              {results.map((w, i) => (
                <ListItem key={i}>{w}</ListItem>
              ))}
            </List>
          </Grow>
        )} 
    </Box>
  );
}
