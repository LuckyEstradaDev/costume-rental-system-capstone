"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ShieldCheck, UserPlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type AdminAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "superadmin";
};

const initialAdmins: AdminAccount[] = [
  {
    id: "1",
    firstName: "Ana",
    lastName: "Reyes",
    email: "ana@company.com",
    role: "superadmin",
  },
  {
    id: "2",
    firstName: "Miguel",
    lastName: "Tan",
    email: "miguel@company.com",
    role: "admin",
  },
];

export default function AccountsPage() {
  const [admins, setAdmins] = useState<AdminAccount[]>(initialAdmins);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
  });

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleCreateAccount = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedFirstName = formData.firstName.trim();
    const trimmedLastName = formData.lastName.trim();
    const trimmedEmail = formData.email.trim();
    const trimmedPassword = formData.password.trim();

    if (
      !trimmedFirstName ||
      !trimmedLastName ||
      !trimmedEmail ||
      !trimmedPassword
    ) {
      return;
    }

    setAdmins((current) => [
      ...current,
      {
        id: typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : String(Date.now()),
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        email: trimmedEmail,
        role: formData.role as AdminAccount["role"],
      },
    ]);

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      role: "admin",
    });
  };

  const filled =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.password.trim();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <UserPlus className="size-4.5 text-primary" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Accounts
            </h1>
            <p className="text-sm text-muted-foreground">
              Create and review admin accounts. Superadmins can add and manage
              other admin users.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Create admin account</CardTitle>
            <CardDescription>
              Add a new admin or superadmin to the dashboard. Only authorized
              users should use this interface.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form onSubmit={handleCreateAccount} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Choose a password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <Button type="submit" disabled={!filled}>
                Create admin
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Existing accounts</CardTitle>
            <CardDescription>
              Review the current admin users and their assigned roles.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="size-4" />
                  <span>Superadmins can manage account creation.</span>
                </div>
                <Badge variant="secondary">{admins.length} users</Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-semibold">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {admin.email}
                      </p>
                    </div>
                    <Badge variant={admin.role === "superadmin" ? "secondary" : "default"}>
                      {admin.role}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
