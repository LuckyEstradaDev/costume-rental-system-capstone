import {CalendarClock} from "lucide-react";
import {
  AdminPageHeader,
  AdminPageTitle,
} from "@/features/admin-dashboard/components/AdminPageHeader";

export default function page() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={<AdminPageTitle icon={CalendarClock}>Reservations</AdminPageTitle>}
        description="Upcoming holds and scheduled rentals."
      />

      <p className="text-sm text-muted-foreground">this is the reservation</p>
    </div>
  );
}
