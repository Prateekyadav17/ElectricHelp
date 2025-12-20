import axios from "axios";

// Vercel env: VITE_API_BASE_URL = https://electrichelp.onrender.com
const RAW = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").trim();

// remove trailing slashes
const ORIGIN = RAW.replace(/\/+$/, "");

// if user didn't include /api, append it
const BASE = ORIGIN.endsWith("/api") ? ORIGIN : `${ORIGIN}/api`;

const api = axios.create({
  baseURL: BASE,          // example: https://electrichelp.onrender.com/api
  withCredentials: false, // keep false since you're using Bearer token
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.code === "ERR_NETWORK") {
      err.userMessage = "Network/CORS error. Check backend URL and CORS origin.";
    }
    return Promise.reject(err);
  }
);

export const authHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token || ""}` } };
};

export default api;
