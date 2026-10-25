import type {INotification} from "./INotification.js";

export interface IUserAddressLevelInterface {
  code: string;
  name: string;
}

export interface IUserAddressInterface {
  region: IUserAddressLevelInterface;
  cityMunicipality: IUserAddressLevelInterface;
  barangay: IUserAddressLevelInterface;
  province?: IUserAddressLevelInterface;
  street?: string;
  postalCode?: string;
}

export interface IUserInterface {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female" | "other";
  profilePicture: string;
  email: string;
  rawPassword: string;
  phoneNumber: string;
  role: "user" | "admin" | "staff";
  address?: IUserAddressInterface | null;
  notifications?: INotification[];
}

export interface IUserProfileUpdateInterface {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  gender?: "male" | "female" | "other";
  phoneNumber?: string;
  address?: IUserAddressInterface | null;
}

export interface IUserLoginInterface {
  email: string;
  rawPassword: string;
}
