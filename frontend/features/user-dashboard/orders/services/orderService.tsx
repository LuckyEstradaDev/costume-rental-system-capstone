import {api} from "@/lib/axios";
import {IRent} from "../../rent/types/IRent";
import {IOrder} from "../../buy/types/IOrder";

export interface UserOrdersResponse {
  orders: IOrder[];
  rents: IRent[];
}

export const fetchOrdersByUserIdService = async (
  userId: string,
): Promise<UserOrdersResponse> => {
  const {data} = await api.get<{data: UserOrdersResponse}>(
    `/api/users/orders/${userId}`,
  );
  return data.data;
};

export const fetchOrderByIdService = async (
  orderId: string,
): Promise<IOrder | IRent> => {
  const {data} = await api.get<{data: IOrder | IRent}>(
    `/api/users/orders/details/${orderId}`,
  );
  return mapOrderTrackingItem(data.data);
};

export const mapOrderTrackingItem = (item: IOrder | IRent): IOrder | IRent => {
  if ("paymentMethod" in item) {
    return item;
  }

  return {
    ...item,
  };
};
