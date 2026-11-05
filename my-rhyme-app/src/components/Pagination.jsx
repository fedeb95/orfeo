import { Button, Stack, Typography } from "@mui/material";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mt: 3 }}>
      <Button variant="outlined" size="small" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
        ◀ Indietro
      </Button>
      <Typography>
        Pagina {page} / {totalPages}
      </Typography>
      <Button variant="outlined" size="small" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>
        Avanti ▶
      </Button>
    </Stack>
  );
}
