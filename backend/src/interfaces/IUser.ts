export interface IUserInterface {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female" | "other";
  profilePicture: string;
  email: string;
  hashedPassword: string;
  phoneNumber: string;
  role: "user" | "admin";
}
