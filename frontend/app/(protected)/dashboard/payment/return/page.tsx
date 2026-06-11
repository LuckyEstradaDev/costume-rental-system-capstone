"use client";

import Link from "next/link";
import {Suspense} from "react";
import {useSearchParams} from "next/navigation";
import {ArrowRight, CheckCircle2, ReceiptText} from "lucide-react";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PaymentReturnPage() {
  return (
    <Suspense fallback={<PaymentReturnLoading />}>
      <PaymentReturnContent />
    </Suspense>
  );
}

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");
  const orderHref = orderId ? `/dashboard/orders/${orderId}` : "/dashboard/orders";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl items-center justify-center">
      <Card className="w-full">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
            <CheckCircle2 className="size-8" />
          </div>
          <CardTitle className="text-2xl">Payment successful</CardTitle>
          <CardDescription>
            Your Stripe payment was completed. You can now return to your order
            details to review the updated status.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-center">
          {sessionId && (
            <div className="rounded-lg border bg-muted/40 px-4 py-3 text-left">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ReceiptText className="size-4 text-muted-foreground" />
                Stripe session
              </div>
              <p className="mt-1 break-all text-xs text-muted-foreground">
                {sessionId}
              </p>
            </div>
          )}

          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href={orderHref}>
              Back to order
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function PaymentReturnLoading() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl items-center justify-center">
      <Card className="w-full p-8 text-center text-muted-foreground">
        Loading payment confirmation...
      </Card>
    </div>
  );
}
