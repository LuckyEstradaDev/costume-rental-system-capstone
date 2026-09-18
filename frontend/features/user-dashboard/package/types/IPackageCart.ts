import {IPackageSnapshot} from "./IPackageSnapshot";

export type IPackageCartItem = {
  userId: string;
  packageItems: IPackageSnapshot[];
};
