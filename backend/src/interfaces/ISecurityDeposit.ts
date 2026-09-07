import type {Types} from "mongoose";

export interface ISecurityDeposit {
  _id?: Types.ObjectId;
  type: "Cash" | "Government ID" | "Non-Government ID" | "Other";
  IDType?: string;
  status: "Pending" | "Held" | "Returned" | "Forfeited";
  verificationStatus?: "Pending" | "Verified" | "Rejected";
  amount?: number; //only available for Cash type
  dateSurrendered?: Date;
  dateReturned?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
