"use client";

import {useEffect, useState, type ChangeEvent, type FormEvent} from "react";
import {Eye, EyeOff, UserPlus, Users, ShieldCheck, ShieldAlert} from "lucide-react";
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
import {PhoneInput} from "@/components/ui/phone-input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  validateStaffForm,
  type StaffFieldErrors,
} from "@/features/auth/utils/validators";
import {serverErrorMessage} from "@/features/auth/services/authService";
import {PasswordGuide} from "@/features/auth/components/password-guide";
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
  dateOfBirth: "",
  // Pinned rather than picked: this form only creates staff accounts. It still
  // has to be sent - the register endpoint defaults to "user", which has no
  // dashboard access.
  role: "staff" as "admin" | "staff",
};

/** Pause before live field errors appear, so typing is not interrupted. */
const VALIDATION_DEBOUNCE_MS = 400;

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
  const [serverFieldErrors, setServerFieldErrors] = useState<StaffFieldErrors>(
    {},
  );
  const [showPassword, setShowPassword] = useState(false);

  // Debounced copy of the form: live regex errors only land once typing pauses.
  const [debouncedForm, setDebouncedForm] = useState(EMPTY_FORM);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedForm(form),
      VALIDATION_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [form]);

  const fieldErrors: StaffFieldErrors = {
    ...validateStaffForm(debouncedForm),
    ...serverFieldErrors,
  };

  const clearErrors = () => {
    setError(null);
    setServerFieldErrors({});
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    clearErrors();
    setForm((f) => ({...f, [name]: value}));
  };

  const handlePhoneChange = (value: string) => {
    clearErrors();
    setForm((f) => ({...f, phoneNumber: value}));
  };

  const handleSelect = (name: string, value: string) => {
    clearErrors();
    setForm((f) => ({...f, [name]: value}));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setServerFieldErrors({});
    setDebouncedForm(form);

    if (Object.keys(validateStaffForm(form)).length > 0) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    if (isAddressIncomplete(address)) {
      setError("Please complete the address or leave it blank.");
      return;
    }

    setLoading(true);

    try {
      await registerAdmin({
        ...form,
        address: toUserAddress(address),
      });

      setForm(EMPTY_FORM);
      setDebouncedForm(EMPTY_FORM);
      setAddress({});
      queryClient.invalidateQueries({queryKey: ["admin-accounts"]});
    } catch (err) {
      const message = serverErrorMessage(err);
      if (/already registered/i.test(message)) {
        setServerFieldErrors({email: message});
      } else if (/date of birth|18 years/i.test(message)) {
        setServerFieldErrors({dateOfBirth: message});
      } else {
        setError(message);
      }
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
    form.dateOfBirth &&
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
            <FieldGroup>
              <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(fieldErrors.firstName)}>
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleInput}
                    placeholder="Ana"
                    className="h-10"
                    aria-invalid={Boolean(fieldErrors.firstName)}
                    required
                  />
                  <FieldError>{fieldErrors.firstName}</FieldError>
                </Field>
                <Field data-invalid={Boolean(fieldErrors.lastName)}>
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleInput}
                    placeholder="Reyes"
                    className="h-10"
                    aria-invalid={Boolean(fieldErrors.lastName)}
                    required
                  />
                  <FieldError>{fieldErrors.lastName}</FieldError>
                </Field>
              </Field>

              <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(fieldErrors.email)}>
                  <FieldLabel htmlFor="email">Email address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleInput}
                    placeholder="admin@example.com"
                    className="h-10"
                    aria-invalid={Boolean(fieldErrors.email)}
                    required
                  />
                  <FieldError>{fieldErrors.email}</FieldError>
                </Field>
                <Field data-invalid={Boolean(fieldErrors.phoneNumber)}>
                  <FieldLabel htmlFor="phoneNumber">Phone number</FieldLabel>
                  <PhoneInput
                    id="phoneNumber"
                    name="phoneNumber"
                    value={form.phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="912 345 6789"
                    className="h-10"
                    aria-invalid={Boolean(fieldErrors.phoneNumber)}
                    required
                  />
                  <FieldError>{fieldErrors.phoneNumber}</FieldError>
                </Field>
              </Field>

              <Field className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field data-invalid={Boolean(fieldErrors.password)}>
                  <FieldLabel htmlFor="rawPassword">Password</FieldLabel>
                  <div className="relative">
                    <Input
                      id="rawPassword"
                      name="rawPassword"
                      type={showPassword ? "text" : "password"}
                      value={form.rawPassword}
                      onChange={handleInput}
                      placeholder="••••••••"
                      className="h-10 pr-10"
                      aria-invalid={Boolean(fieldErrors.password)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      aria-pressed={showPassword}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </Button>
                  </div>
                  <FieldError>{fieldErrors.password}</FieldError>
                  <PasswordGuide password={form.rawPassword} className="pt-1" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="gender">Gender</FieldLabel>
                  <Select
                    value={form.gender}
                    onValueChange={(v) => handleSelect("gender", v)}
                  >
                    <SelectTrigger id="gender" className="h-10 w-full">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>

                {/* Reserved: uncomment together with ROLE_OPTIONS at the top of this
                    file to let the creator choose between admin and staff. Restore
                    it as another Field in this two-column grid when bringing the
                    role picker back.
                <Field>
                  <FieldLabel>Role</FieldLabel>
                  <Select
                    value={form.role}
                    onValueChange={(v) => handleSelect("role", v)}
                  >
                    <SelectTrigger className="h-10 w-full">
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
                </Field>
                */}
              </Field>

              <Field data-invalid={Boolean(fieldErrors.dateOfBirth)}>
                <FieldLabel htmlFor="dateOfBirth">Date of Birth</FieldLabel>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={handleInput}
                  className="h-10"
                  aria-invalid={Boolean(fieldErrors.dateOfBirth)}
                  max={new Date().toISOString().split("T")[0]}
                  required
                />
                <FieldError>{fieldErrors.dateOfBirth}</FieldError>
                <FieldDescription>
                  Staff must be at least 18 years old.
                </FieldDescription>
              </Field>

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

              {error ? (
                <FieldError className="text-sm">{error}</FieldError>
              ) : null}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={!filled || isLoading}
                  size="sm"
                  className="gap-1.5"
                >
                  <UserPlus className="size-3.5" />
                  {isLoading ? "Creating…" : "Create staff account"}
                </Button>
              </div>
            </FieldGroup>
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
                             {admin.firstName} {admin.lastName}
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
