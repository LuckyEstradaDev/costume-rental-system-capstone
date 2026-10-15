"use client";

import {useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";

import {Button} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {AddressFields} from "@/features/address/components/AddressFields";
import {
  isAddressIncomplete,
  toUserAddress,
} from "@/features/address/utils/formatAddress";
import type {AddressFormValue} from "@/features/address/types";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {updateProfileService} from "../services/profileService";

interface EditProfileFormProps {
  redirectTo: string;
  withHeading?: boolean;
}

export function EditProfileForm({
  redirectTo,
  withHeading = true,
}: EditProfileFormProps) {
  const {user, setUser} = useAuth();
  const router = useRouter();
  const [value, setValue] = useState<AddressFormValue>(() =>
    user?.address ? {...user.address} : {},
  );
  const [error, setError] = useState("");
  const [isSaving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (isAddressIncomplete(value)) {
      setError(
        "Please choose a region, city/municipality, and barangay, or clear the address.",
      );
      return;
    }

    setSaving(true);

    try {
      const updated = await updateProfileService(toUserAddress(value));
      setUser(updated);
      router.push(redirectTo);
    } catch {
      setError("Failed to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      {withHeading ? (
        <div className="pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit profile
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update your home address. It is used for deliveries and rentals.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Home address</CardTitle>
          <CardDescription>
            Select your region, province, city or municipality, and barangay.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <AddressFields
              value={value}
              onChange={(next) => {
                setError("");
                setValue(next);
              }}
              idPrefix="edit-profile-address"
            />

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setError("");
                  setValue({});
                }}
                disabled={isSaving}
              >
                Clear address
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(redirectTo)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
