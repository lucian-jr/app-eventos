import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://www.meucopoeco.com.br/eventos_mce/site/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});