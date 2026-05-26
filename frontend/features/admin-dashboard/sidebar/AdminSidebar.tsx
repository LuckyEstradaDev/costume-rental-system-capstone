"use client";

import Link from "next/link";
import type {ComponentType} from "react";
import {usePathname, useRouter} from "next/navigation";
import {useState} from "react";
import {
  BarChart3,
  Boxes,
  ChevronUp,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PackageCheck,
  Settings2,
  ReceiptText,
  UserCircle2,
  Menu,
  X,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {signOutService} from "@/features/auth/services/signOutService";
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
  {label: "Reports", href: "/admin/reports", icon: BarChart3},
];
export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {setAuthenticated, setUser} = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOutService();
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setAuthenticated(false);
    setIsMobileOpen(false);
    router.push("/login");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="fixed left-4 top-4 z-50 rounded-2xl border-primary/20 bg-white text-primary shadow-lg shadow-primary/10 md:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open admin navigation"
      >
        <Menu className="size-5" />
      </Button>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close admin navigation"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[8px_0_30px_rgba(0,0,0,0.12)] transition-all duration-300",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between border-b border-sidebar-border px-6 py-5 bg-primary/5">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Morena&apos;s Gowns and Barong
            </p>
            <h2 className="mt-1 text-lg font-bold text-primary">
              Admin Dashboard
            </h2>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="rounded-2xl text-primary md:hidden"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close admin navigation"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-4 py-5">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={pathname.startsWith(item.href)}
              />
            ))}
          </nav>
        </div>

        <div className="space-y-3 border-t border-sidebar-border px-4 py-4 bg-primary/5">
          <details className="group relative">
            <summary className="flex list-none cursor-pointer items-center gap-3 rounded-xl border border-primary/20 bg-white px-3 py-2.5 shadow-sm">
              <div className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground">
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
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                Sign Out
              </button>
            </div>
          </details>
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
};

function SidebarItem({label, href, icon: Icon, active}: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
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
