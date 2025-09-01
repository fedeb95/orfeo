// src/api.js
import axios from "axios";

// Base URL del back‑end Flask.
// Puoi sovrascriverla con REACT_APP_API_URL nel file .env
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

/**
 * Richiede le rime al backend.
 *
 * @param {Object} params  - { suffix, type, syllables, limit, page }
 * @returns {Promise<Object>}  - risposta JSON del server
 */
export const fetchRhymes = async (params) => {
  try {
    const response = await axios.get(`${BASE_URL}/rhyme`, {
      params,               // axios si occupa di serializzare la query‑string
    });
    return response.data;
  } catch (err) {
    // Propaghiamo l'errore così il componente può gestirlo
    throw err.response ? err.response.data : err;
  }
};
