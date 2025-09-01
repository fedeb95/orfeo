// src/components/SearchForm.jsx
import React, { useState } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Button,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchForm({ onSearch }) {
  const [suffix, setSuffix] = useState("");
  const [type, setType] = useState("perfect");
  const [syllables, setSyllables] = useState("");
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = {
      suffix: suffix.trim(),
      type,
      limit: Number(limit) || 10,
      page: 1,
    };
    if (syllables) params.syllables = Number(syllables);
    onSearch(params);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        mb: 3,
        alignItems: "center",
        // Su schermi piccoli, tutti gli elementi vanno a capo
        "& > *": { flex: "1 1 150px" }, // min‑width 150px, espandibile
      }}
    >    
      <TextField
        label="Suffisso"
        value={suffix}
        onChange={(e) => setSuffix(e.target.value)}
        required
        size="small"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        label="Tipo"
        value={type}
        onChange={(e) => setType(e.target.value)}
        size="small"
        sx={{ minWidth: 130 }}
      >
        <MenuItem value="perfect">Perfetta</MenuItem>
        <MenuItem value="assonance">Assonanza</MenuItem>
        <MenuItem value="consonance">Consonanza</MenuItem>
      </TextField>

      <TextField
        label="Sillabe (facolt.)"
        type="number"
        value={syllables}
        onChange={(e) => setSyllables(e.target.value)}
        size="small"
        sx={{ width: 120 }}
        inputProps={{ min: 1 }}
      />

      <TextField
        label="Limite/pagina"
        type="number"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        size="small"
        sx={{ width: 120 }}
        inputProps={{ min: 1, max: 200 }}
      />

      <Button variant="contained" type="submit" sx={{ height: 40 }}>
        Cerca
      </Button>
    </Box>
  );
}
