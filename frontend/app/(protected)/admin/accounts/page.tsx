"use client";

import {useState, type ChangeEvent, type FormEvent} from "react";
import {UserPlus, Users, ShieldCheck, ShieldAlert} from "lucide-react";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IUserInterface {
  firstName: string;
  lastName: string;
  middleName?: string;
  gender: "male" | "female" | "other";
  profilePicture: string;
  email: string;
  rawPassword: string;
  phoneNumber: string;
  role: "user" | "admin";
}

type AdminAccount = IUserInterface & {id: string};

const initialAdmins: AdminAccount[] = [
  {
    id: "1",
    firstName: "Ana",
    lastName: "Reyes",
    middleName: "Cruz",
    gender: "female",
    profilePicture: "",
    email: "ana@company.com",
    rawPassword: "",
    phoneNumber: "+63 912 345 6789",
    role: "admin",
  },
  {
    id: "2",
    firstName: "Miguel",
    lastName: "Tan",
    gender: "male",
    profilePicture: "",
    email: "miguel@company.com",
    rawPassword: "",
    phoneNumber: "+63 917 987 6543",
    role: "admin",
  },
];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  middleName: "",
  gender: "" as "" | "male" | "female" | "other",
  email: "",
  phoneNumber: "",
  rawPassword: "",
  role: "admin" as "admin" | "user",
};

function getInitials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function Avatar({first, last}: {first: string; last: string}) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
      {getInitials(first, last)}
    </span>
  );
}

export default function AccountsPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>(initialAdmins);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setForm((f) => ({...f, [name]: value}));
  };

  const handleSelect = (name: string, value: string) => {
    setForm((f) => ({...f, [name]: value}));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const {firstName, lastName, email, phoneNumber, rawPassword, gender} = form;
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !phoneNumber.trim() ||
      !rawPassword.trim() ||
      !gender
    )
      return;

    setAdmins((prev) => [
      ...prev,
      {
        id:
          typeof crypto !== "undefined"
            ? crypto.randomUUID()
            : String(Date.now()),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        middleName: form.middleName.trim() || undefined,
        gender,
        profilePicture: "",
        email: email.trim(),
        rawPassword,
        phoneNumber: phoneNumber.trim(),
        role: form.role,
      },
    ]);
    setForm(EMPTY_FORM);
  };

  const filled =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phoneNumber.trim() &&
    form.rawPassword.trim() &&
    form.gender;

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Users className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage admin accounts for the dashboard.
          </p>
        </div>
      </div>

      {/* Create form */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Create admin account</CardTitle>
          </div>
          <CardDescription>
            Fill in the details below to add a new admin user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="firstName"
                  className="text-xs text-muted-foreground"
                >
                  First name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleInput}
                  placeholder="Ana"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="middleName"
                  className="text-xs text-muted-foreground"
                >
                  Middle name
                </Label>
                <Input
                  id="middleName"
                  name="middleName"
                  value={form.middleName}
                  onChange={handleInput}
                  placeholder="Cruz"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="lastName"
                  className="text-xs text-muted-foreground"
                >
                  Last name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleInput}
                  placeholder="Reyes"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Contact row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-xs text-muted-foreground"
                >
                  Email address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInput}
                  placeholder="admin@example.com"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="phoneNumber"
                  className="text-xs text-muted-foreground"
                >
                  Phone number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={form.phoneNumber}
                  onChange={handleInput}
                  placeholder="+63 912 345 6789"
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Password + selects row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="rawPassword"
                  className="text-xs text-muted-foreground"
                >
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rawPassword"
                  name="rawPassword"
                  type="password"
                  value={form.rawPassword}
                  onChange={handleInput}
                  placeholder="••••••••"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Gender <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.gender}
                  onValueChange={(v) => handleSelect("gender", v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={!filled}
                size="sm"
                className="gap-1.5"
              >
                <UserPlus className="size-3.5" />
                Create account
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Admin accounts</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {admins.length} {admins.length === 1 ? "user" : "users"}
            </Badge>
          </div>
          <CardDescription>
            All users with dashboard access. Admins can be managed from this
            table.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 text-xs">Name</TableHead>
                <TableHead className="text-xs">Email</TableHead>
                <TableHead className="text-xs">Phone</TableHead>
                <TableHead className="text-xs">Gender</TableHead>
                <TableHead className="text-xs">Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-2.5">
                      <Avatar first={admin.firstName} last={admin.lastName} />
                      <div>
                        <p className="text-sm font-medium leading-tight">
                          {admin.firstName}
                          {admin.middleName ? ` ${admin.middleName}` : ""}{" "}
                          {admin.lastName}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {admin.email}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {admin.phoneNumber || (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {admin.gender || (
                      <span className="text-muted-foreground/40">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        admin.role === "admin"
                          ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                          : "border-border bg-muted text-muted-foreground"
                      }
                    >
                      {admin.role === "admin" ? (
                        <ShieldAlert className="mr-1 size-3" />
                      ) : null}
                      {admin.role}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
