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
import jwt from "jsonwebtoken";

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

export const registerService = async (data: IUserInterface) => {
  data.email = data.email.trim().toLowerCase();
  const existingUser = await authRepository.findByEmail(data.email);

  if (existingUser) {
    throw new Error("Email already used.");
  }

  await authRepository.register({
    ...data,
    ...(data.address ? {address: normalizeAddress(data.address)} : {}),
  });
};

export const loginService = async (data: IUserLoginInterface) => {
  data.email = data.email.trim().toLowerCase();
  const user = await authRepository.findByEmail(data.email);
  if (!user) throw new HTTPError("Email does not exist", 404);

  const isMatch = await bcrypt.compare(data.rawPassword, user.hashedPassword);
  // const isMatch = data.rawPassword === user.hashedPassword;

  if (!isMatch) throw new HTTPError("Incorrect password", 401);

  const token = jwt.sign(
    {_id: user.id, email: user.email},
    process.env.ACCESS_TOKEN_SECRET!,
  );

  return {token, user};
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
  const update: {address?: IUserAddressInterface | null} = {};

  if (data.address === null) {
    update.address = null;
  } else if (data.address !== undefined) {
    update.address = normalizeAddress(data.address);
  }

  const user = await authRepository.updateProfile(id, update);
  if (!user) throw new HTTPError("User does not exist", 404);

  return {user};
};
