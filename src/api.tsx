import axios from "axios";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  baseURL: process.env.API_BASE_URL || "http://localhost:8080/spectroscopy",
  timeout: 10000,
});

export default api;
