import {
  Banknote,
  Clock,
  FileText,
  IdCard,
  Landmark,
  Lock,
  Undo2,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export type DepositTypeOption = {
  value: "Cash" | "Government ID" | "Non-Government ID" | "Other";
  label: string;
  description: string;
  icon: LucideIcon;
};

export type DepositStatusOption = {
  value: "Pending" | "Held" | "Returned" | "Forfeited";
  label: string;
  description: string;
  icon: LucideIcon;
};

export const TYPE_OPTIONS: DepositTypeOption[] = [
  {
    value: "Cash",
    label: "Cash",
    description: "Cash deposit",
    icon: Banknote,
  },
  {
    value: "Government ID",
    label: "Government ID",
    description: "License / Passport",
    icon: Landmark,
  },
  {
    value: "Non-Government ID",
    label: "Non-Government ID",
    description: "School / Company ID",
    icon: IdCard,
  },
  {
    value: "Other",
    label: "Other",
    description: "Other valid ID",
    icon: FileText,
  },
];

export const STATUS_OPTIONS: DepositStatusOption[] = [
  {
    value: "Pending",
    label: "Pending",
    description: "Awaiting surrender",
    icon: Clock,
  },
  {
    value: "Held",
    label: "Held",
    description: "Currently held",
    icon: Lock,
  },
  {
    value: "Returned",
    label: "Returned",
    description: "Deposit returned",
    icon: Undo2,
  },
  {
    value: "Forfeited",
    label: "Forfeited",
    description: "Deposit forfeited",
    icon: XCircle,
  },
];