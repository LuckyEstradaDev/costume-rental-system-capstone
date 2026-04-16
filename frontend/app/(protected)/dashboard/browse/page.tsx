"use client";

import {useRouter} from "next/navigation";
import {UserSidebar} from "@/features/user-dashboard/sidebar/UserSidebar";
import {OutfitCard} from "@/features/user-dashboard/components/OutfitCard";
import {fetchOutfitsService} from "@/features/admin-dashboard/inventory-tab/services/outfitService";
import {IOutfit} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";
import {useState, useEffect} from "react";

export default function Dashboard() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<IOutfit[]>([]);

  useEffect(() => {
    const fetchOufits = async () => {
      const {data} = await fetchOutfitsService();
      setOutfits(data);
    };

    fetchOufits();
  }, []);

  const handleSignOut = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/sign-out", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // ignore
    }
    router.push("/login");
  };

  return (
    <>
      <div className="grid grid-cols-5 gap-3">
        {outfits.map((item, index) => {
          return <OutfitCard outfit={item} key={index}></OutfitCard>;
        })}
      </div>
    </>
  );
}
