import {api} from "@/lib/axios";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export const fetchOrdersByUserIdService = async (userId: string) => {
  return api.get(`/api/users/orders/${userId}`);
};

export const fetchOrderByIdService = async (orderId: string) => {
  const response = await api.get<{data: IOrder | IRent}>(
    `/api/users/orders/details/${orderId}`,
  );

  return {
    ...response,
    data: {
      ...response.data,
      data: mapOrderTrackingItem(response.data.data),
    },
  };
};

export const mapOrderTrackingItem = (item: IOrder | IRent): IOrder | IRent => {
  if ("paymentMethod" in item) {
    return item;
  }

  return {
    ...item,
  };
};
