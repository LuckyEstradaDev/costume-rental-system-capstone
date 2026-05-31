export const validatePassword = (password: string): boolean => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  return passwordRegex.test(password);
};
