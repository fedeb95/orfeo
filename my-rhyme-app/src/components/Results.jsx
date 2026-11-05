import { Box, List, ListItem, Typography } from "@mui/material";

export default function Results({ items, total, page, totalPages }) {
  if (total === 0) {
    return <Typography sx={{ mt: 2 }}>Nessuna corrispondenza.</Typography>;
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle1" gutterBottom>
        <strong>{total.toLocaleString("it-IT")}</strong> parole trovate – pagina <strong>{page}</strong> di{" "}
        <strong>{totalPages}</strong>
      </Typography>
      <List dense>
        {items.map((w) => (
          <ListItem key={w}>{w}</ListItem>
        ))}
      </List>
    </Box>
  );
}
