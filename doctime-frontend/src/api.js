import axios from "axios";

// DocTime Spring Boot Backend runs on port 1080
const API_BASE_URL = "http://localhost:1080";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
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
