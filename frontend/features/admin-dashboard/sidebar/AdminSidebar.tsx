"use client";

import Link from "next/link";
import type {ComponentType} from "react";
import {usePathname} from "next/navigation";
import {
  Boxes,
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  ReceiptText,
  UserPlus,
  X,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {cn} from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {label: "Orders", href: "/admin/orders", icon: PackageCheck},
  {label: "Inventory", href: "/admin/inventory", icon: Boxes},
  {label: "Reviews", href: "/admin/reviews", icon: MessageSquare},
  {label: "Payments", href: "/admin/payments", icon: ReceiptText},
  // {label: "Reports", href: "/admin/reports", icon: BarChart3},
  // {label: "Settings", href: "/admin/settings", icon: Settings2},
  {label: "Accounts", href: "/admin/accounts", icon: UserPlus},
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({
  isMobileOpen,
  onCloseMobile,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const {user} = useAuth();

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
          onClick={onCloseMobile}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        {/* Matches the header's measured height (`--admin-header-height`, set by
            `AdminHeader`) so the brand block and the bar read as one continuous
            band. The fallback is the bar's `min-h-18`, for the first paint
            before the observer has run. */}
        <div className="flex h-[var(--admin-header-height,4.5rem)] shrink-0 items-center justify-between border-b border-sidebar-border px-6 bg-primary/5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Morena&apos;s Gowns and Barong
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-primary md:hidden"
            onClick={onCloseMobile}
            aria-label="Close admin navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-5">
          <nav className="space-y-1">
            {navigation.map((item) => {
              if (user?.role !== "superadmin" && item.label === "Accounts") {
                return;
              } else {
                return (
                  <SidebarItem
                    key={item.label}
                    {...item}
                    active={pathname.startsWith(item.href)}
                    onNavigate={onCloseMobile}
                  />
                );
              }
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

type SidebarItemProps = {
  label: string;
  href: string;
  active?: boolean;
  icon: ComponentType<{className?: string}>;
  onNavigate?: () => void;
};

function SidebarItem({
  label,
  href,
  icon: Icon,
  active,
  onNavigate,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15"
          : "text-sidebar-foreground/80 hover:bg-primary/10 hover:text-primary",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
