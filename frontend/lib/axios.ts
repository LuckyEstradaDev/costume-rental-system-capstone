import axios from "axios";

const configuredBackendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
const localBackendPattern = /^https?:\/\/(?:localhost|127\.0\.0\.1|\[::1\])(?::\d+)?(?:\/|$)/i;
const backendUrl =
  process.env.NODE_ENV === "development" &&
  !localBackendPattern.test(configuredBackendUrl ?? "")
    ? "http://localhost:5000"
    : configuredBackendUrl;

export const api = axios.create({
  baseURL: backendUrl,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || "Something went wrong";

    console.error(message);

    return Promise.reject(error);
  },
);
