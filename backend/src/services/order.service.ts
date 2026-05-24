import type {INewOrder} from "../interfaces/IOrder.js";
import {OrderRepository} from "../repositories/OrderRepository.js";

const orderRepository = new OrderRepository();

export const orderService = (orderData: INewOrder) => {
  return orderRepository.create(orderData);
};

export const getOrdersByUserIdService = (userId: string) => {
  return orderRepository.getByUserId(userId);
};

export const getAllOrdersService = () => {
  return orderRepository.getAll();
};
