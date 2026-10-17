"use client";

import * as React from "react";
import {X} from "lucide-react";

import {cn} from "@/lib/utils";

export type AlertVariant = "success" | "error" | "warning" | "info";

/**
 * `color` drives the accent rule and the duration rail; `text` is a slightly
 * deeper, still-bright shade so the small uppercase label stays readable on the
 * ivory surface.
 */
const alertVariants: Record<
  AlertVariant,
  {label: string; color: string; text: string}
> = {
  success: {label: "Confirmed", color: "#22c55e", text: "#16a34a"},
  error: {label: "Failed", color: "#ef4444", text: "#dc2626"},
  warning: {label: "Attention", color: "#f59e0b", text: "#d97706"},
  info: {label: "Notice", color: "#3b82f6", text: "#2563eb"},
};

/** How long the exit transition runs before a toast is unmounted. */
const EXIT_DURATION = 180;
/** Default toast lifetime, matching the previous provider default. */
const DEFAULT_DURATION = 4000;

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: AlertVariant;
  onClose?: () => void;
  /**
   * Auto-dismiss lifetime in ms. Omit (or pass a value <= 0) for a persistent
   * alert — the duration rail is only rendered when a lifetime is set.
   */
  duration?: number;
  /** Fired once the lifetime elapses. */
  onExpire?: () => void;
  /** Pass `"closed"` to play the exit animation before the alert unmounts. */
  state?: "open" | "closed";
}

export function Alert({
  title,
  description,
  variant = "info",
  onClose,
  duration,
  onExpire,
  state = "open",
  className,
  ...props
}: AlertProps) {
  const {label, color, text} = alertVariants[variant];

  const elapsedRef = React.useRef(0);
  const pausedRef = React.useRef(false);
  const onExpireRef = React.useRef(onExpire);

  const [entered, setEntered] = React.useState(false);
  const [paused, setPaused] = React.useState(false);

  const autoDismiss = Boolean(duration && duration > 0);
  const active = autoDismiss && state !== "closed";
  const visible = entered && state !== "closed";

  // Play the entrance transition on mount.
  React.useEffect(() => {
    const raf = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Keep the latest expire handler without restarting the countdown.
  React.useEffect(() => {
    onExpireRef.current = onExpire;
  });

  // Mirror paused into a ref so the timer loop reads it without restarting.
  React.useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // Dismiss timer. The rail is animated in CSS; this only tracks elapsed time
  // (pausing when hovered/focused) and fires onExpire when the lifetime ends.
  React.useEffect(() => {
    if (!active) return;

    const total = duration as number;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const delta = now - last;
      last = now;

      if (!pausedRef.current) {
        elapsedRef.current += delta;
        if (elapsedRef.current >= total) {
          onExpireRef.current?.();
          return;
        }
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, duration]);

  return (
    <div
      {...props}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className={cn(
        "relative overflow-hidden rounded-xl border border-black/5 bg-[#fffdf7] py-3 pl-4 pr-3",
        "shadow-[0_6px_18px_-12px_rgba(5,8,27,0.35)]",
        "transition-all duration-200 ease-out",
        visible ? "translate-y-0 opacity-100" : "-translate-y-1.5 opacity-0",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1"
        style={{backgroundColor: color}}
      />

      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{color: text}}
          >
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-foreground">
            {title}
          </p>
          {description ? (
            <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="-mr-1 -mt-1 grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground/60 transition hover:bg-black/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {/* Duration rail — drains left to right across the alert's lifetime. */}
      {autoDismiss ? (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 block h-[3px] overflow-hidden"
          style={{backgroundColor: `${color}22`}}
        >
          <span
            className="alert-rail-fill block h-full w-full origin-left"
            style={
              {
                backgroundColor: color,
                "--alert-rail-duration": `${duration}ms`,
                animationPlayState: paused ? "paused" : "running",
              } as React.CSSProperties
            }
          />
        </span>
      ) : null}
    </div>
  );
}

type Notification = {
  id: string;
  title: string;
  description?: string;
  variant: AlertVariant;
  autoClose?: number;
};

type NotificationContextValue = {
  notify: (notification: Omit<Notification, "id">) => string;
  dismiss: (id: string) => void;
};

const NotificationContext =
  React.createContext<NotificationContextValue | null>(null);

export function NotificationProvider({children}: {children: React.ReactNode}) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [closing, setClosing] = React.useState<Record<string, boolean>>({});
  const exitTimers = React.useRef<Record<string, number>>({});

  const dismiss = React.useCallback((id: string) => {
    setClosing((prev) => (prev[id] ? prev : {...prev, [id]: true}));

    // Only schedule one exit per notification; the toast unmounts itself once
    // the exit transition has finished.
    if (exitTimers.current[id]) return;

    exitTimers.current[id] = window.setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setClosing((prev) => {
        if (!prev[id]) return prev;
        const next = {...prev};
        delete next[id];
        return next;
      });
      delete exitTimers.current[id];
    }, EXIT_DURATION);
  }, []);

  const notify = React.useCallback(
    (notification: Omit<Notification, "id">) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setNotifications((prev) => [...prev, {...notification, id}]);

      return id;
    },
    [],
  );

  React.useEffect(() => {
    const timers = exitTimers.current;
    return () => {
      Object.values(timers).forEach(window.clearTimeout);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{notify, dismiss}}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999]! flex flex-col items-center gap-3 px-4 sm:items-end">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            title={notification.title}
            description={notification.description}
            variant={notification.variant}
            duration={notification.autoClose ?? DEFAULT_DURATION}
            state={closing[notification.id] ? "closed" : "open"}
            onExpire={() => dismiss(notification.id)}
            onClose={() => dismiss(notification.id)}
            className="pointer-events-auto w-full max-w-md"
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
