import axios from "axios";
import "dotenv/config";

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  baseURL: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  timeout: 10000,
});

export default api;
