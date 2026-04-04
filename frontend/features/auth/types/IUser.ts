export interface IUserRegistration {
  // used for registering
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
