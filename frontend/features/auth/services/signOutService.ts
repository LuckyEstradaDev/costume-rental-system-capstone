export const signOutService = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-out`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || "Sign out failed");
  }

  return res;
};
