"use client";

import Link from "next/link";
import {Suspense, useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import {useQuery} from "@tanstack/react-query";
import {isAxiosError} from "axios";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  RotateCcw,
  QrCode,
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
import {
  cardPaymentService,
  gcashPaymentService,
  qrphPaymentService,
} from "@/features/user-dashboard/payment/types/services/PaymentService";
import {
  PaymentProvider,
  usePayment,
} from "@/features/user-dashboard/payment/hooks/usePayment";
import {useNotification} from "@/components/ui/alert";
import Loading from "@/features/reusable/loading";
import {NotFoundView} from "@/features/reusable/NotFoundView";
import {OrderProgress} from "@/features/reusable/OrderProgress";
import {
  buildOrderPath,
  isOrderReference,
  normalizeReference,
} from "@/lib/reference-path";
import {
  calculateReservationAmount,
  formatCurrency,
  formatReadableDateTime,
  getRemainingBalance,
} from "@/lib/formatters";

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
  const reservation = order.payment?.reservation;

  if (reservation?.requested) {
    if (reservation.status === "refunded") {
      return "refunded";
    }

    if (
      reservation.status === "expired" ||
      reservation.status === "forfeited"
    ) {
      return "failed";
    }

    if (reservation.status === "paid") {
      if (
        order.payment?.status === "paid" ||
        order.payment?.method === "cash"
      ) {
        return "success";
      }

      return "pending";
    }

    if (order.payment?.status === "paid") {
      return "success";
    }

    if (
      order.payment?.status === "failed" ||
      order.payment?.status === "cancelled"
    ) {
      return "failed";
    }

    if (order.payment?.status === "refunded") {
      return "refunded";
    }

    return "pending";
  }

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
  const orderReference = normalizeReference(searchParams.get("order_id"));
  const paymentIntentId = searchParams.get("payment_intent_id");
  const isValidOrderReference = isOrderReference(orderReference);

  const {data: order, isLoading, isError, error, refetch} = useQuery<
    IOrder | IRent
  >({
    queryKey: ["user-order", orderReference],
    queryFn: () => fetchOrderByIdService(orderReference),
    enabled: isValidOrderReference,
  });

  if (!isValidOrderReference) {
    return (
      <Shell>
        <NotFoundView
          title="Order not found"
          description="This payment page needs a valid order reference. Return to your orders to continue."
          actions={
            <Button asChild>
              <Link href="/dashboard/orders">Back to orders</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  if (isLoading) {
    return <StatusSkeleton />;
  }

  const isMissingOrder =
    isAxiosError(error) && error.response?.status === 404;

  if (isMissingOrder || (!isError && !order)) {
    return (
      <Shell>
        <NotFoundView
          title="Order not found"
          description="This order may have been removed, or the payment link is out of date."
          actions={
            <Button asChild>
              <Link href="/dashboard/orders">Back to orders</Link>
            </Button>
          }
        />
      </Shell>
    );
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

  if (order.payment?.reservation?.method === "cash") {
    return (
      <Shell>
        <AlertCard
          ring="bg-secondary/10 text-secondary ring-secondary/20"
          title={order.payment.status === "paid" ? "Payment complete" : "Cash reservation"}
          description={
            order.payment.status === "paid"
              ? "Your cash payment has been recorded."
              : order.payment.reservation.status === "approved"
                ? "Staff approved your reservation. Pay the full amount at pickup."
                : "Your request is awaiting staff approval. Pay the full amount at pickup after approval."
          }
          action={
            <Button asChild>
              <Link href={buildOrderPath(order.referenceID) || "/dashboard/orders"}>View order</Link>
            </Button>
          }
        />
      </Shell>
    );
  }

  const variant = resolveVariant(order);
  const reservation = order.payment?.reservation;
  const isReservation = Boolean(reservation?.requested);
  const reservationPaid = reservation?.status === "paid";
  const finalPaymentPaid = order.payment?.status === "paid";
  const reservationAmount = Number(
    reservation?.amount ?? calculateReservationAmount(order.totalAmount),
  );
  const remainingBalance = getRemainingBalance(
    order.totalAmount,
    reservationAmount,
  );
  const finalPaymentMethod = order.payment?.method;
  const reservationMethod = reservation?.method ?? finalPaymentMethod;
  const isBalancePayment = isReservation && reservationPaid && !finalPaymentPaid;
  const isReservationPayment = isReservation && !reservationPaid;
  const activeMethod = isBalancePayment
    ? finalPaymentMethod
    : reservationMethod;
  const presentation = VARIANT_PRESENTATION[variant];
  const title =
    isReservation && variant === "success" && finalPaymentPaid
      ? "Payment complete"
      : presentation.title;
  const description =
    isReservation && variant === "success" && !finalPaymentPaid
      ? `Your reservation is confirmed. Pay the remaining ${formatCurrency(remainingBalance)} in cash at pickup.`
      : isBalancePayment
        ? `Pay the remaining ${formatCurrency(remainingBalance)} online to complete your order.`
        : isReservationPayment
          ? `Pay ${formatCurrency(reservationAmount)} online to reserve this order. The remaining ${formatCurrency(remainingBalance)} is due ${finalPaymentMethod === "cash" ? "in cash at pickup" : "in a second online payment"}.`
          : presentation.description;
  const {Icon, ring} = presentation;
  const orderHref =
    buildOrderPath(order.referenceID) || "/dashboard/orders";

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
          <OrderProgress
            compact
            type={order.type}
            status={order.status}
            paymentMethod={finalPaymentMethod}
            isPaymentPaid={finalPaymentPaid}
            cancelledAt={order.cancelledAt ?? order.updatedAt}
            cancelledFrom={order.cancelledFrom}
            hasSecurityDeposit={
              order.type === "rent" ? Boolean(order.securityDeposit) : false
            }
            isReservationRequested={isReservation}
          />

          <TransactionSummaryCard
            order={order}
            paymentIntentId={
              isBalancePayment
                ? order.payment?.paymentIntentId ?? paymentIntentId ?? undefined
                : reservation?.paymentIntentId ?? paymentIntentId ?? undefined
            }
          />

          {variant === "pending" ? (
            <PendingPaymentPanel
              order={order}
              orderReference={orderReference}
              method={activeMethod}
              isReservation={isReservation}
              isBalancePayment={isBalancePayment}
              reservationAmount={reservationAmount}
              remainingBalance={remainingBalance}
              deadlineAt={reservation?.deadlineAt}
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
  orderReference,
  method,
  isReservation,
  isBalancePayment,
  reservationAmount,
  remainingBalance,
  deadlineAt,
  onRefresh,
}: {
  order: IOrder | IRent;
  orderReference: string;
  method?: string;
  isReservation: boolean;
  isBalancePayment: boolean;
  reservationAmount: number;
  remainingBalance: number;
  deadlineAt?: Date | string;
  onRefresh: () => Promise<unknown>;
}) {
  const {paymentDetails, setPaymentDetails} = usePayment();
  const {notify} = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);
  const [stageIndex, setStageIndex] = useState(0);
  const [qrImageUrl, setQrImageUrl] = useState<string | null>(null);
  const onRefreshRef = useRef(onRefresh);

  onRefreshRef.current = onRefresh;

  const updateField = (field: string, value: string) => {
    setPaymentDetails((previous) => ({...previous, [field]: value}));
  };

  const resolved = resolvePaymentMethod(method);

  useEffect(() => {
    if (!qrImageUrl) {
      return;
    }

    const timer = setInterval(() => {
      void onRefreshRef.current();
    }, 5000);

    return () => clearInterval(timer);
  }, [qrImageUrl]);

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
        await cardPaymentService(order._id, paymentDetails, orderReference);
      } else if (resolved === "gcash" && order._id) {
        await gcashPaymentService(order._id, paymentDetails, orderReference);
      } else if (resolved === "qrph" && order._id) {
        const intent = await qrphPaymentService(order._id, orderReference);

        setQrImageUrl(intent.data.attributes.next_action?.code?.image_url ?? null);
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
      {isReservation && !isBalancePayment && !qrImageUrl && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="size-4 text-amber-600" />
            Reservation payment (50%)
          </p>
          <p className="mt-1 text-muted-foreground">
            Pay {formatCurrency(reservationAmount)} now. The remaining{" "}
            {formatCurrency(remainingBalance)} is due{" "}
            {order.payment?.method === "cash"
              ? "in cash at pickup"
              : "in a second online payment"}
            .
          </p>
          {deadlineAt && (
            <p className="mt-1 text-xs text-muted-foreground">
              Complete this payment by {formatReadableDateTime(deadlineAt)}.
            </p>
          )}
        </div>
      )}
      {isBalancePayment && !qrImageUrl && (
        <div className="rounded-lg border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Clock className="size-4 text-amber-600" />
            Remaining balance
          </p>
          <p className="mt-1 text-muted-foreground">
            Pay {formatCurrency(remainingBalance)} online to complete this
            reservation.
          </p>
        </div>
      )}
      {qrImageUrl ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/40 px-4 py-5">
          <div className="rounded-md bg-white p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrImageUrl}
              alt="QR Ph code for this order"
              className="size-56"
            />
          </div>
          <p className="text-sm font-semibold">Scan to pay with QR Ph</p>
          <p className="text-center text-xs text-muted-foreground">
            Open any participating bank or wallet app and scan the code. It
            expires in 30 minutes. This page updates automatically once your
            payment goes through.
          </p>
        </div>
      ) : (
        <PaymentDetailsPanel
          method={method}
          values={paymentDetails}
          updateField={updateField}
        />
      )}

      <div className="flex justify-end">
        <Button
          onClick={() => {
            void handlePayment();
          }}
          type="button"
          disabled={isProcessing || Boolean(qrImageUrl)}
        >
          {qrImageUrl ? (
            <QrCode className="size-4" />
          ) : (
            <CreditCard className="size-4" />
          )}
          {qrImageUrl
            ? "QR generated"
            : resolved === "qrph"
              ? "Generate QR code"
              : isBalancePayment
                ? "Pay remaining balance"
                : isReservation
                  ? "Pay reservation"
                  : "Pay now"}
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
