import { useState } from "react";
import { Box, Button, InputAdornment, MenuItem, TextField } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchForm({ onSearch, disabled }) {
  const [suffix, setSuffix] = useState("");
  const [type, setType] = useState("perfect");
  const [syllables, setSyllables] = useState("");
  const [limit, setLimit] = useState(10);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      suffix: suffix.trim(),
      type,
      syllables: syllables ? Number(syllables) : null,
      limit: Math.min(Math.max(Number(limit) || 10, 1), 200),
    });
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
        "& > *": { flex: "1 1 150px" },
      }}
    >
      <TextField
        label="Suffisso"
        value={suffix}
        onChange={(e) => setSuffix(e.target.value)}
        required
        size="small"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField select label="Tipo" value={type} onChange={(e) => setType(e.target.value)} size="small">
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
        slotProps={{ htmlInput: { min: 1 } }}
      />

      <TextField
        label="Risultati per pagina"
        type="number"
        value={limit}
        onChange={(e) => setLimit(e.target.value)}
        size="small"
        slotProps={{ htmlInput: { min: 1, max: 200 } }}
      />

      <Button variant="contained" type="submit" disabled={disabled} sx={{ height: 40 }}>
        Cerca
      </Button>
    </Box>
  );
}
