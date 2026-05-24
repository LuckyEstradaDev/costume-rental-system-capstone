import {CreditCard, ReceiptText, Search, WalletCards} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {formatStatusLabel} from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const payments = [
  {reference: "PAY-10031", customer: "Maria Santos", method: "GCash", amount: "₱3,500", status: "Paid", date: "May 1, 2026"},
  {reference: "PAY-10030", customer: "John Cruz", method: "Cash", amount: "₱2,200", status: "Pending", date: "Apr 30, 2026"},
  {reference: "PAY-10029", customer: "Ana Reyes", method: "Maya", amount: "₱4,800", status: "Paid", date: "Apr 29, 2026"},
  {reference: "PAY-10028", customer: "Paolo Dela Cruz", method: "Bank Transfer", amount: "₱6,250", status: "Refunded", date: "Apr 28, 2026"},
];

const summaries = [
  {label: "Collected today", value: "₱18,450", icon: WalletCards},
  {label: "Pending payments", value: "₱7,900", icon: ReceiptText},
  {label: "Online payments", value: "24", icon: CreditCard},
];

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments</h1>
        <p className="mt-1 text-muted-foreground">
          Monitor customer payments, refunds, and collection status.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {summaries.map((summary) => (
          <Card key={summary.label} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{summary.label}</p>
                <p className="mt-2 text-2xl font-bold">{summary.value}</p>
              </div>
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <summary.icon className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Payment records</h2>
            <p className="text-sm text-muted-foreground">
              Static payment list for admin review.
            </p>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-8" placeholder="Search payments" />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>
      </Card>

      <Card className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.reference}>
                <TableCell className="font-medium">{payment.reference}</TableCell>
                <TableCell>{payment.customer}</TableCell>
                <TableCell>{payment.method}</TableCell>
                <TableCell>{payment.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      payment.status === "Paid"
                        ? "secondary"
                        : payment.status === "Refunded"
                          ? "outline"
                          : "destructive"
                    }
                  >
                    {formatStatusLabel(payment.status)}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {payment.amount}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
