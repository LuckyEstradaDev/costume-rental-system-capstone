type SecurityDepositBase = {
  _id?: string;
  status: "Pending" | "Held" | "Returned" | "Forfeited";
  verificationStatus?: "Pending" | "Verified" | "Rejected";
  dateSurrendered?: Date;
  dateReturned?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ISecurityDeposit = SecurityDepositBase &
  (
    | {
        type: "Cash";
        amount: string | number;
        IDType?: never;
      }
    | {
        type: "Government ID" | "Non-Government ID" | "Other";
        amount?: never;
        IDType: string;
      }
  );
