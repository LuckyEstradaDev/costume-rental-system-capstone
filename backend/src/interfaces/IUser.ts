export interface IUserInterface {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female" | "other";
  profilePicture: string;
  email: string;
  rawPassword: string;
  phoneNumber: string;
  role: "user" | "admin";
}

export interface IUserLoginInterface {
  email: string;
  rawPassword: string;
}
