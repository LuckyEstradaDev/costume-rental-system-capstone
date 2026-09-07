import {api} from "@/lib/axios";
import {ISecurityDeposit} from "../types/ISecurityDeposit";

export const updateRentSecurityDepositService = async ({
  id,
  securityDepositData,
}: {
  id: string;
  securityDepositData: ISecurityDeposit;
}) => {
  const res = await api.patch<{data: ISecurityDeposit}>(`/api/rents/${id}`, {
    updateData: {securityDeposit: securityDepositData},
  });
  return res.data;
};
