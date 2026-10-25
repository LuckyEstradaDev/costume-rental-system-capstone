"use client";

import {useEffect, useState, type FormEvent} from "react";
import {useRouter} from "next/navigation";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {AddressFields} from "@/features/address/components/AddressFields";
import {
  isAddressIncomplete,
  toUserAddress,
} from "@/features/address/utils/formatAddress";
import type {AddressFormValue} from "@/features/address/types";
import {useAuth} from "@/features/auth/hooks/useAuth";
import {updateProfileService} from "../services/profileService";
import {validateName, validatePhone} from "@/features/auth/utils/validators";
import {imageUploadService} from "@/services/imageUploadService";
import {ProfilePictureEditor} from "./ProfilePictureEditor";

type GenderValue = "male" | "female" | "other";

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

  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [gender, setGender] = useState<GenderValue | null>(() => {
    const g = user?.gender?.trim() as GenderValue | string | undefined;
    return g === "male" || g === "female" || g === "other" ? g : null;
  });
  const [phone, setPhone] = useState(user?.phoneNumber ?? "");
  const [value, setValue] = useState<AddressFormValue>(() =>
    user?.address ? {...user.address} : {},
  );
  const [pictureFile, setPictureFile] = useState<File | null>(null);
  const [removePicture, setRemovePicture] = useState(false);
  const [picturePreview, setPicturePreview] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (picturePreview) {
        URL.revokeObjectURL(picturePreview);
      }
    };
  }, [picturePreview]);

  const handlePictureChange = ({
    file,
    removed,
  }: {
    file: File | null;
    removed: boolean;
  }) => {
    setError("");
    setPictureFile(file);
    setRemovePicture(removed);
    setPicturePreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!validateName(firstName)) {
      setError("First name can not contain a number or symbol.");
      return;
    }

    if (!validateName(lastName)) {
      setError("Last name can not contain a number or symbol.");
      return;
    }

    if (!gender) {
      setError("Please choose a gender.");
      return;
    }

    if (!validatePhone(phone)) {
      setError("Invalid phone number.");
      return;
    }

    if (isAddressIncomplete(value)) {
      setError(
        "Please choose a region, city/municipality, and barangay, or clear the address.",
      );
      return;
    }

    setSaving(true);

    try {
      let profilePicture: string | null | undefined;

      if (pictureFile) {
        const {data} = await imageUploadService(pictureFile);
        profilePicture = data.url;
      } else if (removePicture) {
        profilePicture = null;
      }

      const updated = await updateProfileService({
        firstName,
        lastName,
        gender,
        phoneNumber: phone,
        address: toUserAddress(value),
        ...(profilePicture !== undefined ? {profilePicture} : {}),
      });
      setUser(updated);
      router.push(redirectTo);
    } catch {
      setError("Failed to update your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddressChange = (next: AddressFormValue) => {
    setError("");
    setValue(next);
  };

  return (
    <div className="min-w-0 space-y-6">
      {withHeading ? (
        <div className="pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            Edit profile
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Update your contact details and home address. It is used for your
            orders and rentals.
          </p>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Personal details</CardTitle>
          <CardDescription>
            Your name, gender, and phone number appear on your orders.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ProfilePictureEditor
              src={
                picturePreview ??
                (removePicture ? null : user?.profilePicture ?? null)
              }
              firstName={firstName}
              lastName={lastName}
              disabled={isSaving}
              canRemove={Boolean(
                picturePreview ||
                  (!removePicture && user?.profilePicture),
              )}
              onChange={handlePictureChange}
            />

            <div className="grid grid-cols-1 gap-4 border-t border-border/60 pt-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={firstName}
                  onChange={(e) => {
                    setError("");
                    setFirstName(e.target.value);
                  }}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={lastName}
                  onChange={(e) => {
                    setError("");
                    setLastName(e.target.value);
                  }}
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={gender ?? ""}
                  onValueChange={(v) => {
                    setError("");
                    setGender(v as GenderValue);
                  }}
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
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber">Phone number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setError("");
                    setPhone(e.target.value);
                  }}
                  className="h-10"
                  required
                />
              </div>
            </div>

            <div className="border-t border-border/60 pt-4">
              <div className="mb-4">
                <CardTitle>Home address</CardTitle>
                <CardDescription className="mt-1">
                  Select your region, province, city or municipality, and
                  barangay.
                </CardDescription>
              </div>

              <AddressFields
                value={value}
                onChange={handleAddressChange}
                idPrefix="edit-profile-address"
              />
            </div>

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/60 pt-4">
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
