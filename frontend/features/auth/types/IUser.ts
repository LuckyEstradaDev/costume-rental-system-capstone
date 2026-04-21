export interface IUser {
  // used for registering but can be used for the user model as well
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  rawPassword: string;
  phoneNumber: string;
  gender: string;
  // add additional info
}

export interface IUserLogin {
  email: string;
  password: string;
}
