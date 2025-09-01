// src/components/Pagination.jsx
import React from "react";

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null; // niente pagine da navigare

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div style={{ marginTop: "1rem" }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={prevDisabled}
        style={{ marginRight: "0.5rem" }}
      >
        ◀ Prev
      </button>

      <span>
        Pagina {page} / {totalPages}
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={nextDisabled}
        style={{ marginLeft: "0.5rem" }}
      >
        Next ▶
      </button>
    </div>
  );
}
