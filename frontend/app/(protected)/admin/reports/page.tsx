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
  {label: "Gross revenue", value: "₱312,480", change: "+8.4%"},
  {label: "Rental utilization", value: "74%", change: "+5.1%"},
  {label: "Completed orders", value: "186", change: "+16"},
  {label: "Late returns", value: "9", change: "-3"},
];

const reports = [
  {name: "Monthly revenue report", range: "April 2026", type: "Finance", status: "Ready"},
  {name: "Rental performance", range: "Q2 2026", type: "Operations", status: "Draft"},
  {name: "Inventory movement", range: "Last 30 days", type: "Inventory", status: "Ready"},
  {name: "Customer activity", range: "Last 30 days", type: "Customers", status: "Ready"},
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="mt-1 text-muted-foreground">
            Static summaries for revenue, rentals, inventory, and customers.
          </p>
        </div>
        <Button>
          <Download className="size-4" />
          Export
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportStats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <p className="text-2xl font-bold">{stat.value}</p>
              <Badge variant="secondary">{stat.change}</Badge>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1.4fr]">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" />
            <h2 className="font-semibold">Revenue by category</h2>
          </div>
          <div className="mt-5 space-y-4">
            <Progress label="Rentals" value="58%" width="58%" />
            <Progress label="Purchases" value="32%" width="32%" />
            <Progress label="Cleaning fees" value="7%" width="7%" />
            <Progress label="Alterations" value="3%" width="3%" />
          </div>
        </Card>

        <Card className="p-0">
          <div className="px-4 pt-4">
            <div className="flex items-center gap-2">
              <FileText className="size-4 text-primary" />
              <h2 className="font-semibold">Saved reports</h2>
            </div>
          </div>
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
                    <Badge variant={report.status === "Ready" ? "secondary" : "outline"}>
                      {formatStatusLabel(report.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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

function Progress({label, value, width}: {label: string; value: string; width: string}) {
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
