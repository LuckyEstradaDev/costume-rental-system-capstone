"use client";

import Link from "next/link";
import {useParams} from "next/navigation";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {ArrowLeft, UserRound} from "lucide-react";
import {AlertDialogComponent} from "@/components/AlertDialog";
import {UserAvatar} from "@/components/UserAvatar";
import {Skeleton} from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {EmptyState} from "@/components/ui/empty-state";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {
  fetchCustomerAccount,
  setAccountStatus,
} from "@/features/admin-dashboard/accounts-tab/services/accountService";
import {formatAddress} from "@/features/address/utils/formatAddress";
import {OrderDetailField, OrderDetailPanel} from "@/features/reusable/OrderDetailPanel";
import {formatReadableDate} from "@/lib/formatters";

export default function CustomerAccountPage() {
  const {customerId} = useParams<{customerId: string}>();
  const queryClient = useQueryClient();
  const {data: customer, isPending, isError} = useQuery({
    queryKey: ["customer-accounts", customerId],
    queryFn: () => fetchCustomerAccount(customerId),
  });
  const statusMutation = useMutation({
    mutationFn: (deactivated: boolean) => setAccountStatus(customerId, deactivated),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["customer-accounts"]}),
  });

  const name = customer
    ? [customer.firstName, customer.middleName, customer.lastName].filter(Boolean).join(" ")
    : "";
  const action = customer?.deactivated ? "Reactivate" : "Deactivate";

  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] min-w-0 space-y-6 bg-muted p-6">
      <AdminPageHeader title={<AdminPageTitle icon={UserRound}>Customer account</AdminPageTitle>} />
      <Button asChild variant="outline" size="sm">
        <Link href="/admin/accounts"><ArrowLeft aria-hidden /> Back to accounts</Link>
      </Button>

      {isPending && (
        <div role="status" aria-label="Loading customer account" className="space-y-5">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({length: 6}, (_, index) => <Skeleton key={index} className="h-5 w-full max-w-md" />)}
          </div>
        </div>
      )}
      {isError && <EmptyState icon={UserRound} title="Could not load customer account" />}
      {customer && (
        <>
          <Card className="flex-row flex-wrap items-center justify-between gap-4 border border-border/50 bg-background p-5 shadow-none sm:p-6">
            <div className="flex min-w-0 items-center gap-4">
              <UserAvatar
                size="lg"
                src={customer.profilePicture}
                firstName={customer.firstName}
                lastName={customer.lastName}
                alt={name}
              />
              <div className="min-w-0">
                <h2 className="break-words text-xl font-semibold text-primary md:text-2xl">{name}</h2>
                <p className="text-sm text-muted-foreground">{customer.deactivated ? "Deactivated" : "Active"}</p>
              </div>
            </div>
            <AlertDialogComponent
              title={`${action} customer account?`}
              description={customer.deactivated ? "Restore access to this customer account." : "Block sign-in and account access for this customer."}
              actionLabel={action}
              isLoading={statusMutation.isPending}
              action={() => statusMutation.mutate(!customer.deactivated)}
            >
              <Button type="button" variant={customer.deactivated ? "outline" : "destructive"} disabled={statusMutation.isPending}>
                {action} account
              </Button>
            </AlertDialogComponent>
          </Card>
          {statusMutation.isError && <p role="alert" className="text-sm text-destructive">Could not change the account status.</p>}

          <div className="grid gap-6 lg:grid-cols-2">
            <OrderDetailPanel title="Personal information" singleColumn>
              <OrderDetailField label="Gender" value={<span className="capitalize">{customer.gender || "—"}</span>} />
              <OrderDetailField label="Date of birth" value={customer.dateOfBirth ? formatReadableDate(customer.dateOfBirth) : "—"} />
              <OrderDetailField label="Age" value={customer.age ?? "—"} />
              <OrderDetailField label="Member since" value={customer.createdAt ? formatReadableDate(customer.createdAt) : "—"} />
            </OrderDetailPanel>
            <OrderDetailPanel title="Contact information" singleColumn>
              <OrderDetailField label="Email" value={customer.email || "—"} />
              <OrderDetailField label="Phone" value={customer.phoneNumber || "—"} />
              <OrderDetailField label="Address" value={formatAddress(customer.address) || "—"} />
            </OrderDetailPanel>
          </div>
        </>
      )}
    </div>
  );
}
