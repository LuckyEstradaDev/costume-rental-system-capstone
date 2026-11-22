import axios from "axios";

export const api = axios.create({
  baseURL: "/",
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
