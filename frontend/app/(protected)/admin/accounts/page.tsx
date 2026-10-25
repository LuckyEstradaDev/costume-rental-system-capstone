"use client";

import {useState, type ChangeEvent, type FormEvent} from "react";
import {UserPlus, Users, ShieldCheck, ShieldAlert} from "lucide-react";
import {UserAvatar} from "@/components/UserAvatar";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {AdminEmptyState} from "@/features/admin-dashboard/components/AdminEmptyState";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
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
import {AddressFields} from "@/features/address/components/AddressFields";
import type {AddressFormValue} from "@/features/address/types";
import {
  formatAddress,
  isAddressIncomplete,
  toUserAddress,
} from "@/features/address/utils/formatAddress";
import {
  fetchAdmins,
  registerAdmin,
} from "@/features/admin-dashboard/accounts-tab/services/accountService";
import {
  validateEmail,
  validateName,
  validatePassword,
  validatePhone,
} from "@/features/auth/utils/validators";
import {useQuery, useQueryClient} from "@tanstack/react-query";

// Reserved for the role picker. Only "staff" accounts can be created here today,
// so the Role <Select> in the form below is commented out and `EMPTY_FORM.role`
// is pinned to "staff". Restore this list and that block together to bring the
// picker back.
// const ROLE_OPTIONS = [
//   {value: "admin", label: "Admin"},
//   {value: "staff", label: "Staff"},
// ] as const;

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  gender: "" as "male" | "female" | "other",
  email: "",
  phoneNumber: "",
  rawPassword: "",
  // Pinned rather than picked: this form only creates staff accounts. It still
  // has to be sent - the register endpoint defaults to "user", which has no
  // dashboard access.
  role: "staff" as "admin" | "staff",
};

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const {data: admins = []} = useQuery({
    queryKey: ["admin-accounts"],
    queryFn: fetchAdmins,
  });
  const staffAccounts = admins.filter((account) => account.role === "staff");
  const [form, setForm] = useState(EMPTY_FORM);
  const [address, setAddress] = useState<AddressFormValue>({});
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    setForm((f) => ({...f, [name]: value}));
  };

  const handleSelect = (name: string, value: string) => {
    setForm((f) => ({...f, [name]: value}));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    try {
      setLoading(true);
      setError("");
      e.preventDefault();
      const {firstName, lastName, email, phoneNumber, rawPassword, gender} =
        form;
      if (
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim() ||
        !phoneNumber.trim() ||
        !rawPassword.trim() ||
        !gender
      )
        return;

      if (!validatePassword(rawPassword)) {
        throw new Error(
          "Password must be at least 8 characters long, contain 1 uppercase letter, and 1 special character.",
        );
      }

      if (!validatePhone(phoneNumber)) {
        throw new Error("Invalid phone number.");
      }

      if (!validateName(firstName) || !validateName(lastName)) {
        throw new Error(
          "Invalid name. Name can not contain a number or symbol.",
        );
      }

      if (!validateEmail(email)) {
        throw new Error("Invalid email.");
      }

      if (isAddressIncomplete(address)) {
        throw new Error("Please complete the address or leave it blank.");
      }

      await registerAdmin({
        ...form,
        address: toUserAddress(address),
      });

      setForm(EMPTY_FORM);
      setAddress({});
      queryClient.invalidateQueries({queryKey: ["admin-accounts"]});
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
      return;
    } finally {
      setLoading(false);
    }
  };

  const filled =
    form.firstName.trim() &&
    form.lastName.trim() &&
    form.email.trim() &&
    form.phoneNumber.trim() &&
    form.rawPassword.trim() &&
    form.gender;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={<AdminPageTitle icon={Users}>Accounts</AdminPageTitle>}
        description="Every staff member with dashboard access."
      />

      {/* Create form */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="size-4 text-muted-foreground" />
            <CardTitle className="text-base">Create staff account</CardTitle>
          </div>
          <CardDescription>
            Add a staff member who can manage orders, inventory, and payments.
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

              {/* Reserved: uncomment together with ROLE_OPTIONS at the top of this
                  file to let the creator choose between admin and staff. The row
                  above is sm:grid-cols-3, so this restores its balance.
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => handleSelect("role", v)}
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              */}
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Address</p>
                <span className="text-xs text-muted-foreground">Optional</span>
              </div>
              <AddressFields
                value={address}
                onChange={setAddress}
                idPrefix="admin-address"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={!filled || isLoading}
                size="sm"
                className="gap-1.5"
              >
                <UserPlus className="size-3.5" />
                {isLoading ? "Loading..." : "Submit"}
              </Button>
            </div>

            {error && (
              <p className="text-sm text-destructive font-medium">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-muted-foreground" />
              <CardTitle className="text-base">Staff accounts</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              {staffAccounts.length}{" "}
              {staffAccounts.length === 1 ? "staff member" : "staff members"}
            </Badge>
          </div>
          <CardDescription>
            Staff members with dashboard access. New staff accounts are added
            above.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* The empty state replaces the table rather than sitting inside it: a
              full-height centred element has nowhere to live in a `TableBody`,
              and a bare header over zero rows is what this page used to render. */}
          {staffAccounts.length === 0 ? (
            <AdminEmptyState
              className="m-4 min-h-72"
              icon={UserPlus}
              title="No staff accounts yet"
              description="Create a staff account above to give a teammate dashboard access."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-xs">Name</TableHead>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Gender</TableHead>
                  <TableHead className="text-xs">Address</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffAccounts.map((admin, index) => (
                  <TableRow key={index}>
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          size="xs"
                          src={admin.profilePicture}
                          firstName={admin.firstName}
                          lastName={admin.lastName}
                        />
                        <div>
                          <p className="text-sm font-medium leading-tight">
                            {admin.firstName}
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
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">
                      {admin.gender || (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-56 text-sm text-muted-foreground">
                      {formatAddress(admin.address) || (
                        <span className="text-muted-foreground/40">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          admin.role === "admin" || admin.role === "staff"
                            ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300"
                            : "border-border bg-muted text-muted-foreground"
                        }
                      >
                        {admin.role === "admin" || admin.role === "staff" ? (
                          <ShieldAlert className="mr-1 size-3" />
                        ) : null}
                        {admin.role}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
