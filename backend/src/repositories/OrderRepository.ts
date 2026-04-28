import type {IOrder} from "../interfaces/IOrder.js";
import {OrderModel} from "../models/OrderModel.js";

export class OrderRepository {
  async create(orderData: IOrder) {
    return await OrderModel.create(orderData);
  }
}
