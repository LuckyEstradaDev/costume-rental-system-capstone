export interface IUser {
  // used for registering but can be used for the user model as well
  _id?: string;
  firstName: string;
  role: string;
  lastName: string;
  email: string;
  rawPassword: string;
  phoneNumber: string;
  gender: string;
  profilePicture?: string;
  createdAt?: string;
  // add additional info
}

export interface IUserRegister extends IUser {
  confirmPassword: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}
