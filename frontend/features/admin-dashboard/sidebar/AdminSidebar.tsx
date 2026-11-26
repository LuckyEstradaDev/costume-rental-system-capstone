"use client";

import Image from "next/image";
import Link from "next/link";
import type {ComponentType, MouseEvent} from "react";
import {useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {
  Boxes,
  ChevronDown,
  LayoutDashboard,
  MessageSquare,
  PackageCheck,
  ReceiptText,
  UserPlus,
  X,
} from "lucide-react";

import coloredLogo from "@/assets/business-logo/Colored-logo.png";
import {Button} from "@/components/ui/button";
import {canAccessAdminPath} from "@/features/admin-dashboard/permissions";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {cn} from "@/lib/utils";

const navigation = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {label: "Orders", href: "/admin/orders", icon: PackageCheck},
  {
    label: "Inventory",
    href: "/admin/inventory",
    icon: Boxes,
    views: [{label: "Outfits", value: "outfits"}, {label: "Packages", value: "packages"}],
  },
  {label: "Reviews", href: "/admin/reviews", icon: MessageSquare},
  {label: "Payments", href: "/admin/payments", icon: ReceiptText},
  {
    label: "Accounts",
    href: "/admin/accounts",
    icon: UserPlus,
    defaultView: "customers",
    views: [{label: "Customer accounts", value: "customers"}, {label: "Staff accounts", value: "staff"}],
  },
];

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export function AdminSidebar({isMobileOpen, onCloseMobile}: AdminSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {user} = useAuth();
  const homeHref =
    user?.role === "staff" ? "/admin/orders" : "/admin/dashboard";

  const handleBrandClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onCloseMobile();

    if (pathname !== homeHref) {
      return;
    }

    event.preventDefault();
    window.scrollTo({top: 0, behavior: "smooth"});
  };

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
        <div className="flex h-[var(--admin-header-height,4.5rem)] shrink-0 items-center justify-between border-b border-sidebar-border px-6 ">
          <Link
            href={homeHref}
            onClick={handleBrandClick}
            aria-label="Morena's Gowns and Barong"
            className="flex min-w-0 shrink items-center gap-2"
          >
            <Image
              src={coloredLogo}
              alt="Morena Gowns and Barongs"
              priority
              className="h-15 w-auto"
            />
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-lg text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground md:hidden"
            onClick={onCloseMobile}
            aria-label="Close admin navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-5">
          <nav className="space-y-1">
            {navigation
              .filter((item) => canAccessAdminPath(user?.role, item.href))
              .map((item) => (
                <SidebarItem
                  key={item.label}
                  {...item}
                  active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                  selectedView={pathname === item.href
                    ? searchParams.get("view") ?? item.defaultView
                    : item.defaultView}
                  onNavigate={onCloseMobile}
                />
              ))}
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
  views?: {label: string; value: string}[];
  selectedView?: string;
};

function SidebarItem({
  label,
  href,
  icon: Icon,
  active,
  onNavigate,
  views,
  selectedView,
}: SidebarItemProps) {
  const [expanded, setExpanded] = useState<boolean | null>(null);
  const open = expanded ?? active ?? false;
  const groupId = `admin-nav-${label.toLowerCase()}`;
  const itemClass = cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-primary hover:text-primary-foreground",
    active
      ? "bg-primary font-semibold text-primary-foreground"
      : "text-sidebar-foreground/80",
  );

  const firstView = views?.[0];
  if (views && firstView) {
    return (
      <div>
        <div className={cn(itemClass, "gap-0 p-0")}>
          <Link href={`${href}?view=${firstView.value}`}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg px-3 py-2.5"
            onClick={() => {
              setExpanded(true);
              onNavigate?.();
            }}
          >
            <Icon className="size-4 shrink-0" />
            <span>{label}</span>
          </Link>
          <button type="button"
            className="mr-1 grid size-8 shrink-0 place-items-center rounded-md"
            aria-label={`${open ? "Collapse" : "Expand"} ${label} submenu`}
            aria-expanded={open}
            aria-controls={groupId}
            onClick={() => setExpanded(!open)}
          >
            <ChevronDown aria-hidden className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              open && "rotate-180",
            )} />
          </button>
        </div>
        <ul id={groupId} hidden={!open} className="mt-2 mr-2 ml-9 space-y-1">
          {views.map((view) => {
            const selected = Boolean(active && selectedView === view.value);
            return (
              <li key={view.value}>
                <Link href={`${href}?view=${view.value}`} onClick={onNavigate}
                  aria-current={selected ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted hover:text-sidebar-foreground",
                    selected ? "bg-muted font-semibold text-sidebar-foreground" : "text-sidebar-foreground/80",
                  )}
                >
                  {view.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={itemClass}
    >
      <Icon className="size-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
