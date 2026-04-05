import Link from "next/link";
import type {ComponentType} from "react";
import {
  BarChart3,
  Boxes,
  CalendarClock,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  Settings2,
  ReceiptText,
  Settings,
  ShieldCheck,
  UserCircle2,
  Users,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    active: true,
  },
  {label: "Reservations", href: "/admin/reservations", icon: CalendarClock},
  {label: "Inventory", href: "/admin/inventory", icon: Boxes},
  {label: "Customers", href: "/admin/customers", icon: Users},
  {label: "Payments", href: "/admin/payments", icon: ReceiptText},
  {label: "Reports", href: "/admin/reports", icon: BarChart3},
];

const management = [
  {label: "Admin Roles", href: "/admin/roles", icon: ShieldCheck},
  {label: "Settings", href: "/admin/settings", icon: Settings},
];

export function AdminSidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Costume Rental
        </p>
        <h2 className="mt-1 text-lg font-bold">Admin Dashboard</h2>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto px-4 py-5">
        <nav className="space-y-1">
          <p className="px-2 pb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Main
          </p>
          {navigation.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </nav>

        <nav className="space-y-1">
          <p className="px-2 pb-2 text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            Management
          </p>
          {management.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
        <div className="rounded-xl border border-sidebar-border bg-card px-3 py-3">
          <p className="text-sm font-semibold">Team Access</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Invite another admin to help manage bookings.
          </p>
          <Button className="mt-3 w-full" size="sm">
            Invite Admin
          </Button>
        </div>

        <details className="group relative">
          <summary className="flex list-none cursor-pointer items-center gap-3 rounded-xl border border-sidebar-border bg-background px-3 py-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <UserCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Admin User</p>
              <p className="truncate text-xs text-muted-foreground">
                admin@costumerental.com
              </p>
            </div>
            <ChevronUp className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="absolute right-0 bottom-14 z-20 w-56 rounded-xl border border-sidebar-border bg-popover p-1 shadow-lg">
            <Link
              href="/admin/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <UserCircle2 className="size-4" />
              My Profile
            </Link>
            <Link
              href="/admin/account-settings"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <Settings2 className="size-4" />
              Account Settings
            </Link>
            <div className="my-1 h-px bg-sidebar-border" />
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
            >
              <LogOut className="size-4" />
              Sign Out
            </button>
          </div>
        </details>
      </div>
    </aside>
  );
}

type SidebarItemProps = {
  label: string;
  href: string;
  active?: boolean;
  icon: ComponentType<{className?: string}>;
};

function SidebarItem({label, href, icon: Icon, active}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
