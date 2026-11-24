"use client";

import {AlertDialogComponent} from "@/components/AlertDialog";
import {useEffect, useRef, useState, type ChangeEvent, type FormEvent} from "react";
import {Eye, EyeOff, Pencil, Trash2, UserPlus, Users} from "lucide-react";
import {UserAvatar} from "@/components/UserAvatar";
import {StatusBadge} from "@/components/ui/status-badge";
import {Button} from "@/components/ui/button";
import {EmptyState} from "@/components/ui/empty-state";
import {AdminPageHeader, AdminPageTitle} from "@/features/admin-dashboard/components/AdminPageHeader";
import {Dialog, DialogClose} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  AdminDialogBody,
  AdminDialogContent,
  AdminDialogFooter,
  AdminDialogHeader,
} from "@/features/admin-dashboard/components/AdminDialog";
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
  sanitizeNameInput,
  type StaffFieldErrors,
} from "@/features/auth/utils/validators";
import {serverErrorMessage} from "@/features/auth/services/authService";
import {PasswordGuide} from "@/features/auth/components/password-guide";
import type {IUser} from "@/features/auth/types/IUser";
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
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [staffAction, setStaffAction] = useState<{kind: "edit" | "delete"; staff: IUser} | null>(null);
  const isEditing = staffAction?.kind === "edit";
  const staffActionTrigger = useRef<HTMLButtonElement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [confirmPassword, setConfirmPassword] = useState("");
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
    ...(isEditing ? {} : validateStaffForm(debouncedForm)),
    ...serverFieldErrors,
  };
  const passwordMismatch = confirmPassword !== "" && confirmPassword !== form.rawPassword;

  const restoreStaffActionFocus = (event: Event) => {
    if (!staffActionTrigger.current) return;
    event.preventDefault();
    staffActionTrigger.current.focus();
    staffActionTrigger.current = null;
  };

  const clearErrors = () => {
    setError(null);
    setServerFieldErrors({});
  };

  const closeCreateDialog = () => {
    setCreateOpen(false);
    setStaffAction(null);
    setForm(EMPTY_FORM);
    setDebouncedForm(EMPTY_FORM);
    setConfirmPassword("");
    setAddress({});
    setShowPassword(false);
    clearErrors();
  };

  const handleCreateOpenChange = (open: boolean) => {
    if (open) setCreateOpen(true);
    else if (!isLoading) closeCreateDialog();
  };

  const openEditDialog = (staff: IUser, trigger: HTMLButtonElement) => {
    const {firstName, lastName, email, phoneNumber, gender, dateOfBirth} = staff;
    staffActionTrigger.current = trigger;
    setForm({
      ...EMPTY_FORM,
      firstName,
      lastName,
      email,
      phoneNumber: phoneNumber ?? "",
      gender: gender === "male" || gender === "female" || gender === "other"
        ? gender
        : EMPTY_FORM.gender,
      dateOfBirth: dateOfBirth?.slice(0, 10) ?? "",
    });
    setAddress(staff.address ?? {});
    setStaffAction({kind: "edit", staff});
  };

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    const {name, value} = e.target;
    clearErrors();
    const isNameField = name === "firstName" || name === "lastName";
    setForm((f) => ({
      ...f,
      [name]: isNameField ? sanitizeNameInput(value) : value,
    }));
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
    if (isLoading || isEditing) return;
    setError("");
    setServerFieldErrors({});
    setDebouncedForm(form);

    if (Object.keys(validateStaffForm(form)).length > 0) {
      setError("Please fix the highlighted fields before continuing.");
      return;
    }

    if (!confirmPassword || passwordMismatch) {
      setError("Enter a matching password confirmation.");
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

      closeCreateDialog();
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
    confirmPassword &&
    !passwordMismatch &&
    form.dateOfBirth &&
    form.gender;

  return (
    <div className="-m-6 min-h-[calc(100vh-4.5rem)] min-w-0 space-y-6 bg-muted p-6 pb-24">
      <AdminPageHeader
        title={<AdminPageTitle icon={Users}>Accounts</AdminPageTitle>}
        description="Every staff member with dashboard access."
      />

      <Dialog open={isCreateOpen || isEditing} onOpenChange={handleCreateOpenChange}>
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h2 className="text-xl font-semibold text-primary md:text-2xl">Staff accounts</h2>
            <span className="text-sm tabular-nums text-muted-foreground">
              {staffAccounts.length} {staffAccounts.length === 1 ? "staff member" : "staff members"}
            </span>
          </div>

          {staffAccounts.length === 0 ? (
            <EmptyState icon={UserPlus} title="No staff accounts yet" />
          ) : (
            <Table gridlines>
              <TableHeader className="[&_tr]:border-0">
                <TableRow className="border-0 hover:bg-transparent">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="[&_tr]:border-0">
                {staffAccounts.map((admin, index) => (
                  <TableRow key={index} className="border-0 transition-colors hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserAvatar
                          size="xs"
                          src={admin.profilePicture}
                          firstName={admin.firstName}
                          lastName={admin.lastName}
                        />
                        <div>
                          <p className="text-sm font-medium leading-tight text-secondary">
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
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm capitalize text-muted-foreground">
                      {admin.gender || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-56 text-sm text-muted-foreground">
                      {formatAddress(admin.address) || (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={admin.role} />
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" onClick={(event) => openEditDialog(admin, event.currentTarget)}>
                          <Pencil aria-hidden="true" />
                          Edit
                        </Button>
                        <Button type="button" variant="destructive" size="sm" onClick={(event) => {
                          staffActionTrigger.current = event.currentTarget;
                          setStaffAction({kind: "delete", staff: admin});
                        }}>
                          <Trash2 aria-hidden="true" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur md:left-72">
          <div className="flex items-center justify-end px-4 py-3 md:px-6">
            <AlertDialogComponent
              action={() => setCreateOpen(true)}
              title="Add a staff account?"
              description="Open the form to create a new staff account."
              actionLabel="Continue"
            >
              <Button type="button" size="lg" className="w-full sm:w-auto">
                <UserPlus aria-hidden="true" />
                Add Staff
              </Button>
            </AlertDialogComponent>
          </div>
        </div>

        <AdminDialogContent width="2xl" showCloseButton={!isLoading} onCloseAutoFocus={restoreStaffActionFocus}>
          <AdminDialogHeader
            title={isEditing ? "Edit staff account" : "Add staff account"}
            description={isEditing ? "Changes made here are not saved." : "Give a staff member access to Inventory, Orders, and Reviews."}
          />
          <form onSubmit={handleSubmit} className="flex min-h-0 flex-col bg-background">
            <AdminDialogBody>
              <FieldGroup>
                <Field className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

                <Field className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field data-invalid={Boolean(fieldErrors.email)}>
                    <FieldLabel htmlFor="email">Email address</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleInput}
                      placeholder="johndoe@email.com"
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

                <Field className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field data-invalid={Boolean(fieldErrors.password)}>
                    <FieldLabel htmlFor="rawPassword">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="rawPassword"
                        name="rawPassword"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={form.rawPassword}
                        onChange={handleInput}
                        placeholder="••••••••"
                        className="h-10 pr-10"
                        aria-invalid={Boolean(fieldErrors.password)}
                        required={!isEditing}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 hover:bg-secondary hover:text-secondary-foreground"
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
                  <Field data-invalid={passwordMismatch}>
                    <FieldLabel htmlFor="confirmStaffPassword">Confirm password</FieldLabel>
                    <Input
                      id="confirmStaffPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) => {
                        clearErrors();
                        setConfirmPassword(event.target.value);
                      }}
                      className="h-10"
                      aria-invalid={passwordMismatch}
                      aria-describedby={passwordMismatch ? "confirmStaffPasswordError" : undefined}
                      required={!isEditing}
                    />
                    <FieldError id="confirmStaffPasswordError">
                      {passwordMismatch ? "Passwords do not match." : undefined}
                    </FieldError>
                  </Field>
                </Field>

                <Field className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
                  <Field data-invalid={Boolean(fieldErrors.dateOfBirth)}>
                    <FieldLabel htmlFor="dateOfBirth">Date of birth</FieldLabel>
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
                </Field>

                <div className="space-y-3 pt-3">
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
              </FieldGroup>
            </AdminDialogBody>
            <AdminDialogFooter className="items-stretch sm:items-center">
              {error && <FieldError className="sm:mr-auto">{error}</FieldError>}
              <DialogClose asChild>
                <Button type="button" size="lg" variant="outline" disabled={isLoading}>
                  Cancel
                </Button>
              </DialogClose>
              {isEditing ? (
                <Button type="button" size="lg" disabled>Save changes</Button>
              ) : (
                <Button type="submit" size="lg" disabled={!filled} loading={isLoading}>
                  {isLoading ? "Creating…" : "Create staff account"}
                </Button>
              )}
            </AdminDialogFooter>
          </form>
        </AdminDialogContent>
      </Dialog>

      <AlertDialog open={staffAction?.kind === "delete"} onOpenChange={(open) => {
        if (!open) setStaffAction(null);
      }}>
        <AlertDialogContent onCloseAutoFocus={restoreStaffActionFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete staff account?</AlertDialogTitle>
            <AlertDialogDescription>
              {staffAction?.kind === "delete" && (
                <>Deleting this account would remove dashboard access for {staffAction.staff.firstName} {staffAction.staff.lastName}. Deletion is unavailable.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
