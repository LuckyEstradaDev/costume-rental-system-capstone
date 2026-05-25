import {BarChart3, Download, FileText, TrendingUp} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";
import {formatStatusLabel} from "@/lib/formatters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const reportStats = [
  {label: "Gross revenue", value: "₱312,480", icon: BarChart3},
  {label: "Rental utilization", value: "74%", icon: TrendingUp},
  {label: "Completed orders", value: "186", icon: FileText},
  {label: "Late returns", value: "9", icon: Download},
];

const reports = [
  {
    name: "Monthly revenue report",
    range: "April 2026",
    type: "Finance",
    status: "Ready",
  },
  {
    name: "Rental performance",
    range: "Q2 2026",
    type: "Operations",
    status: "Draft",
  },
  {
    name: "Inventory movement",
    range: "Last 30 days",
    type: "Inventory",
    status: "Ready",
  },
  {
    name: "Customer activity",
    range: "Last 30 days",
    type: "Customers",
    status: "Ready",
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <BarChart3 className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Reports
            </h1>
            <p className="text-sm text-muted-foreground">
              Static summaries for revenue, rentals, inventory, and customers.
            </p>
          </div>
        </div>
        <Button>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Revenue by category</h2>
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="size-4" />
            </div>
          </div>
          <div className="mt-5 space-y-4">
            <Progress label="Rentals" value="58%" width="58%" />
            <Progress label="Purchases" value="32%" width="32%" />
            <Progress label="Cleaning fees" value="7%" width="7%" />
            <Progress label="Alterations" value="3%" width="3%" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold">Saved reports</h2>
            <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-4 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Range</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.name}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{report.range}</TableCell>
                    <TableCell>{report.type}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          report.status === "Ready" ? "secondary" : "outline"
                        }
                      >
                        {formatStatusLabel(report.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" />
          <h2 className="font-semibold">Operational notes</h2>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Note title="Most rented category" value="Formal gowns" />
          <Note title="Best purchase item" value="Classic black suit" />
          <Note title="Peak pickup day" value="Saturday" />
        </div>
      </Card>
    </div>
  );
}

function Progress({
  label,
  value,
  width,
}: {
  label: string;
  value: string;
  width: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{width}} />
      </div>
    </div>
  );
}

function Note({title, value}: {title: string; value: string}) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
