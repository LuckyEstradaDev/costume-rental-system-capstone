"use client";

import Link from "next/link";
import {Suspense, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  RotateCcw,
  TriangleAlert,
  Undo2,
  XCircle,
} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardHeader} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {cn} from "@/lib/utils";
import {
  PaymentDetailsPanel,
  resolvePaymentMethod,
} from "@/features/user-dashboard/payment/components/PaymentDetailsPanel";
import {TransactionSummaryCard} from "@/features/user-dashboard/payment/components/TransactionSummaryCard";
import {fetchOrderByIdService} from "@/features/user-dashboard/orders/services/orderService";
import type {IOrder} from "@/features/user-dashboard/buy/types/IOrder";
import type {IRent} from "@/features/user-dashboard/rent/types/IRent";
import {cardPaymentService, gcashPaymentService} from "@/features/user-dashboard/payment/types/services/PaymentService";
import {
  PaymentProvider,
  usePayment,
} from "@/features/user-dashboard/payment/hooks/usePayment";
import {useNotification} from "@/components/ui/alert";
import Loading from "@/features/reusable/loading";

type PaymentVariant = "success" | "failed" | "refunded" | "pending";

const PROCESSING_STAGES = [
  "Submitting your payment details",
  "Verifying with your bank",
  "Confirming your order",
];

const PROCESSING_STAGE_INTERVAL_MS = 900;
const PROCESSING_MIN_DURATION_MS = 2400;

const VARIANT_PRESENTATION: Record<
  PaymentVariant,
  {
    Icon: typeof CheckCircle2;
    ring: string;
    title: string;
    description: string;
  }
> = {
  success: {
    Icon: CheckCircle2,
    ring: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    title: "Payment successful",
    description: "Your payment was received and your order is being prepared.",
  },
  pending: {
    Icon: Clock,
    ring: "bg-amber-50 text-amber-600 ring-amber-100",
    title: "Complete your payment",
    description: "Reserved but not paid yet. Enter your details to finish it.",
  },
  failed: {
    Icon: XCircle,
    ring: "bg-destructive/10 text-destructive ring-destructive/20",
    title: "Payment unsuccessful",
    description: "This payment did not go through. Try another method.",
  },
  refunded: {
    Icon: Undo2,
    ring: "bg-slate-100 text-slate-600 ring-slate-200",
    title: "Payment refunded",
    description: "This payment was refunded to the method you used.",
  },
};

function resolveVariant(order: IOrder | IRent): PaymentVariant {
  const status = order.payment?.status;

  if (status === "paid") {
    return "success";
  }

  if (status === "failed" || status === "cancelled") {
    return "failed";
  }

  if (status === "refunded") {
    return "refunded";
  }

  return "pending";
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<StatusSkeleton />}>
      <PaymentProvider>
        <PaymentStatusContent />
      </PaymentProvider>
    </Suspense>
  );
}

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const paymentIntentId = searchParams.get("payment_intent_id");

  const {data: order, isLoading, isError, refetch} = useQuery<
    IOrder | IRent
  >({
    queryKey: ["user-order", orderId],
    queryFn: () => fetchOrderByIdService(orderId!),
    enabled: Boolean(orderId),
  });

  if (!orderId) {
    return (
      <Shell>
        <AlertCard
          ring="bg-muted text-muted-foreground ring-border"
          title="No order reference"
          description="This page needs an order reference to show your payment details."
        />
      </Shell>
    );
  }

  if (isLoading) {
    return <StatusSkeleton />;
  }

  if (isError || !order) {
    return (
      <Shell>
        <AlertCard
          ring="bg-destructive/10 text-destructive ring-destructive/20"
          title="Could not load your order"
          description="Something went wrong while retrieving this order. Please try again."
          action={
            <Button type="button" onClick={() => void refetch()}>
              <RotateCcw className="size-4" />
              Try again
            </Button>
          }
        />
      </Shell>
    );
  }

  const variant = resolveVariant(order);
  const {Icon, ring, title, description} = VARIANT_PRESENTATION[variant];
  const orderHref = `/dashboard/orders/${order._id}`;

  return (
    <Shell>
      <Card className="w-full gap-3 py-4">
        <CardHeader className="flex-row items-center gap-3 space-y-0 px-4">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ring-1 ${ring}`}
          >
            <Icon className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight">{title}</h1>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 px-4">
          <TransactionSummaryCard
            order={order}
            paymentIntentId={paymentIntentId ?? undefined}
          />

          {variant === "pending" ? (
            <PendingPaymentPanel
              order={order}
              method={order.payment?.method}
              onRefresh={() => refetch()}
            />
          ) : (
            <StatusActions variant={variant} orderHref={orderHref} />
          )}
        </CardContent>
      </Card>
    </Shell>
  );
}

function PendingPaymentPanel({
  order,
  method,
  onRefresh,
}: {
  order: IOrder | IRent;
  method?: string;
  onRefresh: () => Promise<unknown>;
}) {
  const {paymentDetails, setPaymentDetails} = usePayment();
  const {notify} = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);

  const updateField = (field: string, value: string) => {
    setPaymentDetails((previous) => ({...previous, [field]: value}));
  };

  const resolved = resolvePaymentMethod(method);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    const timer = setInterval(() => {
      setStageIndex((index) =>
        Math.min(index + 1, PROCESSING_STAGES.length - 1),
      );
    }, PROCESSING_STAGE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isProcessing]);

  const handlePayment = async () => {
    if (isProcessing) {
      return;
    }

    setStageIndex(0);
    setIsProcessing(true);
    const startedAt = Date.now();

    try {
      if (resolved === "card" && order._id) {
        await cardPaymentService(order._id, paymentDetails);
      } else if (resolved === "gcash" && order._id) {
        await gcashPaymentService(order._id, paymentDetails);
      }
      await onRefresh();
    } catch (error) {
      notify({
        title: "Payment failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred while processing your payment.",
        variant: "error",
      });
      console.error("Payment failed:", error);
    } finally {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(0, PROCESSING_MIN_DURATION_MS - elapsed);
      await new Promise((resolve) => setTimeout(resolve, remaining));
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <PaymentDetailsPanel
        method={method}
        values={paymentDetails}
        updateField={updateField}
      />

      <div className="flex justify-end">
        <Button
          onClick={() => {
            void handlePayment();
          }}
          type="button"
          disabled={isProcessing}
        >
          <CreditCard className="size-4" />
          Pay {resolved === "qrph" ? "with QR" : "now"}
        </Button>
      </div>

      <Loading
        label={PROCESSING_STAGES[stageIndex]}
        className={cn(
          "transition-opacity motion-reduce:transition-none",
          isProcessing
            ? "opacity-100 duration-200"
            : "pointer-events-none opacity-0 duration-300",
        )}
      />
    </div>
  );
}

function StatusActions({
  variant,
  orderHref,
}: {
  variant: PaymentVariant;
  orderHref: string;
}) {
  if (variant !== "failed") {
    return null;
  }

  return (
    <div className="flex justify-end">
      <Button asChild>
        <Link href={orderHref}>
          <RotateCcw className="size-4" />
          Try again
        </Link>
      </Button>
    </div>
  );
}

function AlertCard({
  ring,
  title,
  description,
  action,
}: {
  ring: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="w-full gap-3 py-5">
      <CardHeader className="items-center gap-2 px-4 text-center">
        <div
          className={`flex size-10 items-center justify-center rounded-full ring-1 ${ring}`}
        >
          <TriangleAlert className="size-5" />
        </div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      {action ? (
        <CardContent className="flex justify-center px-4">{action}</CardContent>
      ) : null}
    </Card>
  );
}

function Shell({children}: {children: React.ReactNode}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] max-w-2xl justify-center">
      <div className="my-auto w-full self-start">{children}</div>
    </div>
  );
}

function StatusSkeleton() {
  return (
    <Shell>
      <Card className="w-full gap-3 py-4">
        <CardHeader className="flex-row items-center gap-3 space-y-0 px-4">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3 w-72" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </Shell>
  );
}
