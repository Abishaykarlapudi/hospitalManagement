import axios from "axios";

// DocTime Spring Boot Backend
// When running locally: http://localhost:1080
// When hosted together on Render (https://doctime-backend-di1m.onrender.com): relative path ""
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:1080"
    : "");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 25000,
});

// Response interceptor to extract clean error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = "An unexpected error occurred.";
    if (error.response) {
      if (typeof error.response.data === "string") {
        message = error.response.data;
      } else if (error.response.data?.message) {
        message = error.response.data.message;
      } else {
        message = `Request failed with status ${error.response.status}`;
      }
    } else if (error.request) {
      message = "Cannot connect to DocTime backend server at http://localhost:1080. Please ensure Spring Boot is running.";
    } else {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
