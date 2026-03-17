export interface INewRent {
  userID: string;
  rentedItems: string[];
  rentStart: Date;
  rentEnd: Date;
  pickupTime: Date;
  returnTime: Date;
  status: "pending" | "active" | "overdue" | "cancelled";
}
