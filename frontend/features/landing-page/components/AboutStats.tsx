"use client";

import {useQuery} from "@tanstack/react-query";
import {getUserCountService} from "@/features/admin-dashboard/dashboard/services/services";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {aboutUsData} from "@/features/landing-page/data";

function formatCount(value: number | undefined) {
  return value === undefined ? "—" : value.toLocaleString();
}

export default function AboutStats() {
  const outfitsQuery = useQuery({
    queryKey: ["outfits"],
    queryFn: fetchOutfitsService,
  });
  const usersQuery = useQuery({
    queryKey: ["landing-user-count"],
    queryFn: getUserCountService,
  });

  const stats = [
    {
      value: outfitsQuery.isLoading
        ? "—"
        : formatCount(outfitsQuery.data?.length),
      label: "Outfits in Catalog",
    },
    {
      value: usersQuery.isLoading
        ? "—"
        : formatCount(usersQuery.data?.data.count),
      label: "Registered Clients",
    },
    {
      value: String(new Date().getFullYear() - aboutUsData.foundingYear),
      label: "Years of Service",
    },
  ];

  return (
    <div className="mt-12 grid grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-5xl font-semibold text-[#6f3a91]">{stat.value}</p>
          <p className="mt-2 text-xs tracking-wide text-[#7a7a7a] uppercase">
            {stat.label}
          </p>
        </div>
      ))}
    </div>
  );
}
