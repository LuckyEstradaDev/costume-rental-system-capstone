import axios from "axios";

export async function sessionAuthenticationService() {
  const res = await axios.get(`http://localhost:5000/api/auth/me`, {
    withCredentials: true,
  });
  return res;
}
