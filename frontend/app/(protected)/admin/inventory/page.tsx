"use client";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {AddOutfitModal} from "@/features/admin-dashboard/inventory-tab/components/AddOutfitModal";
import OutfitAnalytics from "@/features/admin-dashboard/inventory-tab/components/OutfitAnalytics";
import OutfitCard from "@/features/admin-dashboard/inventory-tab/components/OutfitCard";
import {Plus} from "lucide-react";
import {useState} from "react";

export default function Page() {
  const [isAddOutfitOpen, setAddOutfitOpen] = useState(false);
  return (
    <>
      <div className="flex">
        <OutfitAnalytics></OutfitAnalytics>
      </div>
      <div className="flex items-center">
        <Input placeholder="Search"></Input>

        <AddOutfitModal
          onOpenChange={setAddOutfitOpen}
          open={isAddOutfitOpen}
        ></AddOutfitModal>
      </div>
      <OutfitCard></OutfitCard>
    </>
  );
}
