import type {IOrder} from "../interfaces/IOrder.js";
import type {IPayment} from "../interfaces/IPayment.js";
import {OrderRepository} from "../repositories/OrderRepository.js";

const orderRepository = new OrderRepository();

export const orderService = (orderData: IOrder, paymentData: IPayment) => {
  return orderRepository.create(orderData, paymentData);
};

export const getOrdersByUserIdService = (userId: string) => {
  return orderRepository.getByUserId(userId);
};

export const getAllOrdersService = () => {
  return orderRepository.getAll();
};
