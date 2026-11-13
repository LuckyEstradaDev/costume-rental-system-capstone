const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^\+639\d{9}$/;
const passwordRegex =
  /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

export const MIN_SIGNUP_AGE = 18;

export const validatePassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

export function validateEmail(email: string): boolean {
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  return phoneRegex.test(phone);
}

export function validateName(name: string): boolean {
  return /^[a-zA-Z\s]+$/.test(name);
}

/** Age in whole years for a date of birth string, or null when invalid. */
export function ageFromDOB(dateOfBirth: string): number | null {
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob.getTime() > Date.now()) return null;

  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export type RegisterFieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "phoneNumber" | "dateOfBirth" | "password" | "confirmPassword",
    string
  >
>;

/**
 * Per-field signup errors, shown live while typing. A field only reports an
 * error once it has content (or a password mismatch once both are filled) so
 * untouched fields stay quiet.
 */
export function validateRegisterForm(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  rawPassword: string;
  confirmPassword: string;
}): RegisterFieldErrors {
  const errors: RegisterFieldErrors = {};

  if (formData.firstName && !validateName(formData.firstName)) {
    errors.firstName = "First name can only contain letters and spaces.";
  }
  if (formData.lastName && !validateName(formData.lastName)) {
    errors.lastName = "Last name can only contain letters and spaces.";
  }
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = "Enter a valid email address (e.g. juan@example.com).";
  }
  if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
    errors.phoneNumber =
      "Enter a valid PH mobile number (e.g. +63 917 123 4567).";
  }
  if (formData.dateOfBirth) {
    const age = ageFromDOB(formData.dateOfBirth);
    if (age === null) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    } else if (age < MIN_SIGNUP_AGE) {
      errors.dateOfBirth = `You must be at least ${MIN_SIGNUP_AGE} years old to sign up.`;
    }
  }
  if (formData.rawPassword && !validatePassword(formData.rawPassword)) {
    errors.password = "Password does not meet the requirements below.";
  }
  if (formData.confirmPassword && formData.confirmPassword !== formData.rawPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export type StaffFieldErrors = Partial<
  Record<
    "firstName" | "lastName" | "email" | "phoneNumber" | "dateOfBirth" | "password",
    string
  >
>;

/** Per-field errors for the admin "create staff account" form. */
export function validateStaffForm(formData: {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  rawPassword: string;
}): StaffFieldErrors {
  const errors: StaffFieldErrors = {};

  if (formData.firstName && !validateName(formData.firstName)) {
    errors.firstName = "First name can only contain letters and spaces.";
  }
  if (formData.lastName && !validateName(formData.lastName)) {
    errors.lastName = "Last name can only contain letters and spaces.";
  }
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = "Enter a valid email address (e.g. juan@example.com).";
  }
  if (formData.phoneNumber && !validatePhone(formData.phoneNumber)) {
    errors.phoneNumber =
      "Enter a valid PH mobile number (e.g. +63 917 123 4567).";
  }
  if (formData.dateOfBirth) {
    const age = ageFromDOB(formData.dateOfBirth);
    if (age === null) {
      errors.dateOfBirth = "Enter a valid date of birth.";
    } else if (age < MIN_SIGNUP_AGE) {
      errors.dateOfBirth = `Staff must be at least ${MIN_SIGNUP_AGE} years old.`;
    }
  }
  if (formData.rawPassword && !validatePassword(formData.rawPassword)) {
    errors.password = "Password does not meet the requirements below.";
  }

  return errors;
}
