"use client";

import {useState} from "react";
import {OrdersFilterTabs} from "@/features/user-dashboard/orders/components/OrdersFilterTabs";
import type {OrdersFilter} from "@/features/user-dashboard/orders/components/OrdersFilterTabs";
import {OrdersList} from "@/features/user-dashboard/orders/components/OrdersList";
import {OrdersStats} from "@/features/user-dashboard/orders/components/OrdersStats";
import {orderTrackingData} from "@/features/user-dashboard/orders/data/orderTrackingData";

export default function OrdersPage() {
  const [activeFilter, setActiveFilter] = useState<OrdersFilter>("all");

  const filteredItems = orderTrackingData.filter((item) => {
    if (activeFilter === "all") {
      return true;
    }

    return item.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          Track your costume purchases and rentals.
        </p>
      </div>

      <OrdersStats items={orderTrackingData} />

      <div className="flex items-center justify-between">
        <OrdersFilterTabs
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      </div>

      <OrdersList items={filteredItems} />
    </div>
  );
}
