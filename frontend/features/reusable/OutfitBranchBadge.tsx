import {MapPin} from "lucide-react";

import {Badge} from "@/components/ui/badge";
import {cn} from "@/lib/utils";
import {
  getOutfitBranchLabel,
} from "@/features/admin-dashboard/inventory-tab/constants/constants";
import type {
  OutfitBranch,
} from "@/features/admin-dashboard/inventory-tab/types/IOutfit";

type OutfitBranchBadgeProps = {
  branch?: OutfitBranch | "" | null;
  className?: string;
};

export function OutfitBranchBadge({branch, className}: OutfitBranchBadgeProps) {
  const label = getOutfitBranchLabel(branch);

  if (!label) return null;

  return (
    <Badge className={cn("gap-1 bg-primary text-primary-foreground", className)}>
      <MapPin className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}
