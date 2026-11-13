const PH_PHONE_REGEX = /^\+639\d{9}$/;

/**
 * Normalizes `09XXXXXXXXX`, `639XXXXXXXXX`, and `+639XXXXXXXXX` to the stored
 * `+639XXXXXXXXX` form. Returns null for anything that is not a PH mobile.
 */
export const normalizePhoneNumber = (value: string): string | null => {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("63")) {
    digits = digits.slice(2);
  } else if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  const phoneNumber = `+63${digits}`;
  return PH_PHONE_REGEX.test(phoneNumber) ? phoneNumber : null;
};
