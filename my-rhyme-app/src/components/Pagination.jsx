// src/components/Pagination.jsx
import React from "react";
import { Stack, Button, Typography } from "@mui/material";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <Stack
      direction="row"
      spacing={2}
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 3 }}
    >
      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ◀ Prev
      </Button>

      <Typography>
        Pagina {page} / {totalPages}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next ▶
      </Button>
    </Stack>
  );
}
