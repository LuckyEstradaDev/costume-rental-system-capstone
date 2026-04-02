import axios from "axios";

export async function sessionAuthenticationService() {
  const res = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
    {
      withCredentials: true,
    },
  );
  return res;
}
