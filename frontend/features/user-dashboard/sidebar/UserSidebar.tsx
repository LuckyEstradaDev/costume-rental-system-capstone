"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";
import type {ComponentType} from "react";
import {
  CalendarClock,
  ChevronUp,
  LogOut,
  LayoutDashboard,
  Settings2,
  ShoppingBag,
  UserCircle2,
  ReceiptText,
  ShoppingCart,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {cn} from "@/lib/utils";

const navigation = [
  {
    label: "Browse Costumes",
    href: "/dashboard/browse",
    icon: ShoppingBag,
  },
  {
    label: "My Cart",
    href: "/dashboard/cart",
    icon: ShoppingCart,
  },
  {
    label: "My Reservations",
    href: "/dashboard/reservations",
    icon: CalendarClock,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: ReceiptText,
  },
];

const account = [
  {label: "Profile", href: "/dashboard/profile", icon: UserCircle2},
  {label: "Settings", href: "/dashboard/settings", icon: Settings2},
];

export function UserSidebar() {
  return (
    <aside className="fixed top-0 left-0 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Costume Rental
        </p>
        <h2 className="mt-1 text-lg font-bold">User Dashboard</h2>
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
            Account
          </p>
          {account.map((item) => (
            <SidebarItem key={item.label} {...item} />
          ))}
        </nav>
      </div>

      <div className="space-y-3 border-t border-sidebar-border px-4 py-4">
        <div className="rounded-xl border border-sidebar-border bg-card px-3 py-3">
          <p className="text-sm font-semibold">Need Help?</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Contact support for booking or payment concerns.
          </p>
          <Button className="mt-3 w-full" size="sm">
            Contact Support
          </Button>
        </div>

        <details className="group relative">
          <summary className="flex list-none cursor-pointer items-center gap-3 rounded-xl border border-sidebar-border bg-background px-3 py-2.5">
            <div className="grid size-9 place-items-center rounded-full bg-sidebar-primary text-sidebar-primary-foreground">
              <UserCircle2 className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Customer Name</p>
              <p className="truncate text-xs text-muted-foreground">
                customer@costumerental.com
              </p>
            </div>
            <ChevronUp className="size-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>

          <div className="absolute right-0 bottom-14 z-20 w-56 rounded-xl border border-sidebar-border bg-popover p-1 shadow-lg">
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            >
              <UserCircle2 className="size-4" />
              My Profile
            </Link>
            <Link
              href="/dashboard/settings"
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
  icon: ComponentType<{className?: string}>;
};

function SidebarItem({label, href, icon: Icon}: SidebarItemProps) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

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
