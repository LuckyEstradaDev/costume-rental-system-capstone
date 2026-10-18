"use client";

import Link from "next/link";
import {useRouter} from "next/navigation";
import {
  ChevronDown,
  LogOut,
  PackageCheck,
  ShoppingCart,
  UserRound,
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
import {signOutService} from "@/features/auth/services/signOutService";
import {useCartCount} from "@/features/user-dashboard/cart/hooks/useCartCount";
import {NotificationDropdown} from "./NotificationDropdown";

/**
 * The fixed customer header: the brand mark, the cart and notifications
 * shortcuts, and the account menu - the counterpart to `AdminHeader`, with the
 * sidebar gone.
 *
 * The brand mark is a bare primary circle that links home to the browse page.
 * The cart badge is only rendered when there is something in the cart, so an
 * empty cart shows no number rather than a `0`.
 *
 * Cart is gated: a signed-out visitor browsing the catalog gets the auth dialog
 * instead of being navigated into a page they cannot use, matching the
 * behaviour the removed sidebar had. The notifications bell is signed-in only,
 * since a guest has nothing to be notified about.
 */
export function UserHeader() {
  const {user, setAuthenticated, setUser, isAuthenticated, openAuthModal} =
    useAuth();
  const router = useRouter();
  const cartCount = useCartCount();
  const fullName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Customer";
  const initials =
    [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("") || "";

  const handleSignOut = async () => {
    try {
      await signOutService();
    } catch (error) {
      console.error(error);
    }

    setUser(null);
    setAuthenticated(false);
    router.push("/login");
  };

  const handleProtectedNav = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      event.preventDefault();
      openAuthModal(true);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-background/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-1 px-4 md:gap-2 md:px-6">
        <Link
          href="/dashboard/browse"
          aria-label="Morena's Gowns and Barong"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="size-8 rounded-full bg-primary" />
          <span className="text-lg font-bold tracking-tight text-primary">
            Morena
          </span>
        </Link>

        <div className="min-w-0 flex-1" />

        <Link
          href="/dashboard/browse"
          className="group relative shrink-0 pb-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse
          <span className="absolute inset-x-0 -bottom-0.5 h-[3px] origin-left scale-x-0 rounded-full bg-primary transition-transform duration-300 group-hover:scale-x-100" />
        </Link>

        <Button
          asChild
          variant="ghost"
          size="icon-lg"
          className="relative text-foreground"
        >
          <Link
            href="/dashboard/cart"
            onClick={handleProtectedNav}
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
          >
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-none text-primary-foreground">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </Button>

        {isAuthenticated ? (
          <>
            <NotificationDropdown />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="group flex cursor-pointer items-center gap-3 rounded-lg py-1.5 pl-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50 sm:pr-3"
                >
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold uppercase text-primary-foreground">
                    {initials || <UserRound className="size-4" />}
                  </span>
                  <span className="hidden min-w-0 sm:block">
                    <span className="block truncate text-sm font-semibold">
                      {fullName}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {user?.email}
                    </span>
                  </span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 sm:hidden">
                  <p className="truncate text-sm font-semibold">{fullName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator className="sm:hidden" />

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <UserRound className="size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/orders" onClick={handleProtectedNav}>
                    <PackageCheck className="size-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  variant="destructive"
                  onSelect={handleSignOut}
                >
                  <LogOut className="size-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            type="button"
            size="sm"
            className="ml-1"
            onClick={() => router.replace("/login")}
          >
            Sign In
          </Button>
        )}
      </div>
    </header>
  );
}
