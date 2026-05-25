"use client";

import * as React from "react";
import {AlertTriangle, CheckCircle2, Info, X, XCircle} from "lucide-react";

import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";

export type AlertVariant = "success" | "error" | "warning" | "info";

const alertVariantStyles: Record<AlertVariant, string> = {
  success: "border-green-200 bg-green-50 text-green-950",
  error: "border-red-200 bg-red-50 text-red-950",
  warning: "border-amber-200 bg-amber-50 text-amber-950",
  info: "border-sky-200 bg-sky-50 text-sky-950",
};

const alertIconMap: Record<AlertVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  variant?: AlertVariant;
  onClose?: () => void;
}

export function Alert({
  title,
  description,
  variant = "info",
  onClose,
  className,
  ...props
}: AlertProps) {
  const Icon = alertIconMap[variant];

  return (
    <div
      className={cn(
        "group/alert relative flex items-start gap-4 overflow-hidden rounded-3xl border p-4 shadow-sm transition-all",
        alertVariantStyles[variant],
        className,
      )}
      {...props}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/90 text-current shadow-sm">
        <Icon className="size-5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <p className="text-sm font-semibold tracking-tight">{title}</p>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {onClose ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="self-start text-current opacity-80 transition hover:opacity-100"
          onClick={onClose}
          aria-label="Close notification"
        >
          <X className="size-4" />
        </Button>
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
  const timers = React.useRef<Record<string, number>>({});

  const removeNotification = React.useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );
  }, []);

  const notify = React.useCallback(
    (notification: Omit<Notification, "id">) => {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

      setNotifications((prev) => [...prev, {...notification, id}]);

      const timeout = notification.autoClose ?? 4000;
      if (timeout > 0) {
        timers.current[id] = window.setTimeout(
          () => removeNotification(id),
          timeout,
        );
      }

      return id;
    },
    [removeNotification],
  );

  const dismiss = React.useCallback(
    (id: string) => {
      removeNotification(id);

      if (timers.current[id]) {
        window.clearTimeout(timers.current[id]);
        delete timers.current[id];
      }
    },
    [removeNotification],
  );

  React.useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(window.clearTimeout);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{notify, dismiss}}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-3 px-4 sm:items-end">
        {notifications.map((notification) => (
          <Alert
            key={notification.id}
            title={notification.title}
            description={notification.description}
            variant={notification.variant}
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
