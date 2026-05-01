import {api} from "@/lib/axios";

export const fetchOrdersByUserIdService = async (userId: string) => {
  return api.get(`/api/users/orders/${userId}`);
};
