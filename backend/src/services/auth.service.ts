import type {
  IUserInterface,
  IUserLoginInterface,
  IUserProfileUpdateInterface,
  IUserAddressInterface,
  IUserAddressLevelInterface,
} from "../interfaces/IUser.js";
import {UserModel} from "../models/UserModel.js";
import {AuthRepository} from "../repositories/AuthRepository.js";
import {HTTPError} from "../utils/HttpError.js";
import bcrypt from "bcrypt";
import { OTPRepository } from "../repositories/OTPRepository.js";
import { verifyOTPService } from "./otp.service.js";
import { sendOTPEmail } from "./email.service.js";
import { OTP_EXPIRY_MS } from "../config/otp.js";

let authRepository = new AuthRepository();

const normalizeAddressLevel = (
  level?: IUserAddressLevelInterface,
): IUserAddressLevelInterface | undefined => {
  if (!level?.code || !level?.name) {
    return undefined;
  }

  return {code: level.code, name: level.name};
};

const normalizeAddress = (
  address: IUserAddressInterface,
): IUserAddressInterface => {
  const region = normalizeAddressLevel(address.region);
  const cityMunicipality = normalizeAddressLevel(address.cityMunicipality);
  const barangay = normalizeAddressLevel(address.barangay);
  const province = normalizeAddressLevel(address.province);

  if (!region || !cityMunicipality || !barangay) {
    throw new HTTPError(
      "Address must include a region, city/municipality, and barangay.",
      400,
    );
  }

  return {
    region,
    cityMunicipality,
    barangay,
    ...(province ? {province} : {}),
    ...(address.street?.trim() ? {street: address.street.trim()} : {}),
    ...(address.postalCode?.trim()
      ? {postalCode: address.postalCode.trim()}
      : {}),
  };
};

const isCloudinaryImageUrl = (value: string) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com";
  } catch {
    return false;
  }
};

const MIN_SIGNUP_AGE = 18;

/** Age in whole years at today's date, adjusted for the birthday not yet reached. */
const ageAtToday = (dob: Date): number => {
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    now.getMonth() < dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

/** Parses and validates a signup date of birth, returning it with its age. */
const resolveDateOfBirth = (
  dateOfBirth: string | Date | undefined,
): {dateOfBirth: Date; age: number} => {
  const tooYoung = new HTTPError(
    "You must be at least 18 years old to sign up.",
    400,
  );

  const isMissing =
    dateOfBirth === undefined ||
    dateOfBirth === null ||
    (typeof dateOfBirth === "string" && dateOfBirth.trim() === "");
  if (isMissing) throw new HTTPError("Date of birth is required.", 400);

  const dob =
    dateOfBirth instanceof Date ? dateOfBirth : new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime()) || dob.getTime() > Date.now()) throw tooYoung;

  const age = ageAtToday(dob);
  if (age < MIN_SIGNUP_AGE) throw tooYoung;

  return {dateOfBirth: dob, age};
};

export const registerService = async (data: IUserInterface) => {
  data.email = data.email.trim().toLowerCase();
  const existingUser = await authRepository.findByEmail(data.email);

  if (existingUser) {
    throw new HTTPError("Email is already registered.", 409);
  }

  const dob = resolveDateOfBirth(data.dateOfBirth);

  const user = await authRepository.register({
    ...data,
    dateOfBirth: dob.dateOfBirth,
    age: dob.age,
    ...(data.address ? {address: normalizeAddress(data.address)} : {}),
  });

  const otpRepo = new OTPRepository();

  const existingOTP = await otpRepo.getByUserID(user._id.toString(), "ACCOUNT_VERIFICATION", "PENDING");
  if (existingOTP) {
    await otpRepo.update(existingOTP._id.toString(), { status: "EXPIRED" });
  }
  
  //create a random 6-digit OTP
  const rawOTP = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const otpRecord = await otpRepo.create({userId: user._id.toString(), email: user.email, otpHash: hashedOTP, status: "PENDING", purpose: "ACCOUNT_VERIFICATION", expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)});

  try {
    await sendOTPEmail({
      to: user.email,
      otp: rawOTP,
      name: user.firstName,
      purpose: "ACCOUNT_VERIFICATION",
    });
  } catch (emailError) {
    console.error("Failed to send OTP email:", emailError);
  }

  return {userId: user._id, email: user.email, otpRecordId: otpRecord._id};
};

export const loginService = async (data: IUserLoginInterface) => {
  data.email = data.email.trim().toLowerCase();
  const user = await authRepository.findByEmail(data.email);
  if (!user) throw new HTTPError("Email does not exist", 404);

  const isMatch = await bcrypt.compare(data.rawPassword, user.hashedPassword);
  // const isMatch = data.rawPassword === user.hashedPassword;

  if (!isMatch) throw new HTTPError("Incorrect password", 401);
  const otpRepo = new OTPRepository();

  const rawOTP = Math.floor(100000 + Math.random() * 900000).toString()
  const hashedOTP = await bcrypt.hash(rawOTP, 10);
  const existingOTP = await otpRepo.getByUserID(user._id.toString(), "ACCOUNT_VERIFICATION", "PENDING");
  if (existingOTP) {
    await otpRepo.update(existingOTP._id.toString(), { status: "EXPIRED" });
  }
  const otpRecord = await otpRepo.create({userId: user._id.toString(), email: user.email, otpHash: hashedOTP, status: "PENDING", purpose: "ACCOUNT_VERIFICATION", expiresAt: new Date(Date.now() + OTP_EXPIRY_MS)});

  try {
    await sendOTPEmail({
      to: user.email,
      otp: rawOTP,
      name: user.firstName,
      purpose: "ACCOUNT_VERIFICATION",
    });
  } catch (emailError) {
    console.error("Failed to send OTP email:", emailError);
  }

  return {user, otpRecordId: otpRecord._id, email: user.email};
};

export const verifyMe = async (id: string) => {
  const user = await authRepository.findUserById(id);
  if (!user) throw new HTTPError("User does not exist", 404);
  return {user};
};

export const updateProfileService = async (
  id: string,
  data: IUserProfileUpdateInterface,
) => {
  const update: Record<string, unknown> = {};

  if (data.firstName !== undefined) {
    const trimmed = data.firstName.trim();
    if (trimmed.length === 0) {
      throw new HTTPError("First name cannot be empty.", 400);
    }
    update.firstName = trimmed;
  }

  if (data.lastName !== undefined) {
    const trimmed = data.lastName.trim();
    if (trimmed.length === 0) {
      throw new HTTPError("Last name cannot be empty.", 400);
    }
    update.lastName = trimmed;
  }

  if (data.middleName !== undefined) {
    update.middleName = data.middleName.trim() || null;
  }

  if (data.gender !== undefined) {
    const allowed = ["male", "female", "other"] as const;
    if (!allowed.includes(data.gender as any)) {
      throw new HTTPError("Invalid gender value.", 400);
    }
    update.gender = data.gender;
  }

  if (data.phoneNumber !== undefined) {
    const trimmed = data.phoneNumber.trim();
    if (trimmed.length === 0) {
      throw new HTTPError("Phone number cannot be empty.", 400);
    }
    update.phoneNumber = trimmed;
  }

  if (data.address === null) {
    update.address = null;
  } else if (data.address !== undefined) {
    update.address = normalizeAddress(data.address);
  }

  if (data.profilePicture === null) {
    update.profilePicture = null;
  } else if (data.profilePicture !== undefined) {
    const profilePicture = data.profilePicture.trim();
    if (!isCloudinaryImageUrl(profilePicture)) {
      throw new HTTPError("Invalid profile picture URL.", 400);
    }
    update.profilePicture = profilePicture;
  }

  const user = await authRepository.updateProfile(id, update);
  if (!user) throw new HTTPError("User does not exist", 404);

  return {user};
};
