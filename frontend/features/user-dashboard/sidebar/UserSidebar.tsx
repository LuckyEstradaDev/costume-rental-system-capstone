"use client";

import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {useEffect, useState, type ComponentType} from "react";
import {
  ChevronUp,
  LogOut,
  Menu,
  PackageCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ShoppingCart,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {cn} from "@/lib/utils";

const navigation = [
  {
    label: "Discover Outfits",
    description: "Find your next look",
    href: "/dashboard/browse",
    icon: Search,
  },
  {
    label: "Fitting Bag",
    description: "Review your picks",
    href: "/dashboard/cart",
    icon: ShoppingCart,
  },
  {
    label: "My Rentals",
    description: "Track orders",
    href: "/dashboard/orders",
    icon: PackageCheck,
  },
];

export function UserSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {user, setAuthenticated, setUser} = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") ||
    "CR";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const animationFrame = window.requestAnimationFrame(() => {
      setIsCollapsed(mediaQuery.matches);
    });

    const handleMediaChange = (event: MediaQueryListEvent) => {
      setIsCollapsed(event.matches);
      setIsMobileOpen(false);
    };

    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--user-sidebar-width",
      isCollapsed ? "5rem" : "18rem",
    );

    return () => {
      document.documentElement.style.removeProperty("--user-sidebar-width");
    };
  }, [isCollapsed]);

  const handleSignOut = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/sign-out`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setAuthenticated(false);
    router.push("/login");
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon-lg"
        className="fixed left-4 top-4 z-50 rounded-2xl border-purple-100 bg-white shadow-lg shadow-primary/10 md:hidden"
        onClick={() => setIsMobileOpen(true)}
        aria-label="Open navigation"
      >
        <Menu className="size-5" />
      </Button>

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[1px] md:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-purple-100 bg-white text-foreground shadow-[8px_0_30px_rgba(112,60,142,0.06)] transition-all duration-300 md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className={cn("px-5 pb-4 pt-5", isCollapsed && "md:px-3")}>
          <div
            className={cn(
              "mb-3 flex items-center justify-between gap-3",
              isCollapsed && "md:justify-center",
            )}
          >
            <Link
              href="/dashboard/browse"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "flex min-w-0 items-center gap-3",
                isCollapsed && "md:hidden",
              )}
            >
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </div>
              <p className="truncate text-sm font-bold">Costume Rental</p>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hidden shrink-0 rounded-xl md:inline-flex"
              onClick={() => setIsCollapsed((current) => !current)}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!isCollapsed}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-xl md:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-label="Close navigation"
            >
              <X className="size-4" />
            </Button>
          </div>

          <Link
            href="/dashboard/browse"
            onClick={() => setIsMobileOpen(false)}
            className={cn(
              "hidden items-center rounded-2xl border border-purple-100 bg-purple-50/70 p-3 transition hover:border-purple-200 hover:bg-purple-50",
              isCollapsed ? "justify-center md:p-2" : "gap-3",
              isCollapsed && "md:flex",
            )}
            title="Costume Rental"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div className={cn("min-w-0", isCollapsed && "md:hidden")}>
              <p className="truncate text-sm font-bold">Costume Rental</p>
            </div>
          </Link>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-5 md:px-3">
          <nav className="space-y-1">
            {navigation.map((item) => (
              <SidebarItem
                key={item.label}
                {...item}
                active={
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                }
                isCollapsed={isCollapsed}
                onNavigate={() => setIsMobileOpen(false)}
              />
            ))}
          </nav>
        </div>

        <div
          className={cn(
            "border-t border-purple-100 bg-purple-50/40 px-4 py-4",
            isCollapsed && "md:px-3",
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl border border-purple-100 bg-white p-3 text-left shadow-sm transition hover:border-purple-200 hover:bg-purple-50/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  isCollapsed &&
                    "md:justify-center md:border-transparent md:bg-transparent md:p-0 md:shadow-none",
                )}
                title={fullName || "Customer"}
              >
                <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
                  {initials}
                </div>
                <div
                  className={cn("min-w-0 flex-1", isCollapsed && "md:hidden")}
                >
                  <p className="truncate text-sm font-semibold">
                    {fullName || "Customer"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email || "customer@costumerental.com"}
                  </p>
                </div>
                <ChevronUp
                  className={cn(
                    "size-4 shrink-0 text-muted-foreground transition-transform",
                    isCollapsed && "md:hidden",
                  )}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="top"
              sideOffset={10}
              className="w-56 rounded-xl border-purple-100 p-1 shadow-lg"
            >
              <DropdownMenuItem asChild className="cursor-pointer gap-2 px-3 py-2">
                <Link
                  href="/dashboard/profile"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <UserRound className="size-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2 px-3 py-2"
                onClick={handleSignOut}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>
    </>
  );
}

type SidebarItemProps = {
  label: string;
  description: string;
  href: string;
  active?: boolean;
  isCollapsed: boolean;
  onNavigate: () => void;
  icon: ComponentType<{className?: string}>;
};

function SidebarItem({
  label,
  description,
  href,
  icon: Icon,
  active,
  isCollapsed,
  onNavigate,
}: SidebarItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={label}
      className={cn(
        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all",
        isCollapsed && "md:justify-center md:px-2",
        active
          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/15"
          : "text-muted-foreground hover:bg-purple-50 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl transition-colors",
          active
            ? "bg-white/15 text-primary-foreground"
            : "bg-muted text-foreground group-hover:bg-white",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className={cn("min-w-0", isCollapsed && "md:hidden")}>
        <span className="block truncate font-semibold">{label}</span>
        <span
          className={cn(
            "block truncate text-xs",
            active ? "text-primary-foreground/75" : "text-muted-foreground",
          )}
        >
          {description}
        </span>
      </span>
    </Link>
  );
}
