"use client";

import {useState} from "react";
import {UserRound} from "lucide-react";

import {cn} from "@/lib/utils";

type UserAvatarSize = "xs" | "sm" | "md" | "lg";

const sizeClasses: Record<UserAvatarSize, string> = {
  xs: "size-7 text-[10px]",
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-24 text-3xl ring-4 ring-background",
};

const iconSizeClasses: Record<UserAvatarSize, string> = {
  xs: "size-3.5",
  sm: "size-4",
  md: "size-5",
  lg: "size-11",
};

interface UserAvatarProps {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: UserAvatarSize;
  className?: string;
  alt?: string;
}

export function UserAvatar({
  src,
  firstName,
  lastName,
  size = "sm",
  className,
  alt,
}: UserAvatarProps) {
  const initials = [firstName, lastName]
    .filter(Boolean)
    .map((name) => name?.[0])
    .join("")
    .toUpperCase();
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-full bg-primary font-bold uppercase text-primary-foreground",
        sizeClasses[size],
        className,
      )}
    >
      <span className="grid place-items-center">
        {initials || <UserRound className={iconSizeClasses[size]} />}
      </span>
      {src ? (
        <AvatarImage
          key={src}
          src={src}
          alt={
            alt ??
            (fullName ? `${fullName}'s profile picture` : "Profile picture")
          }
        />
      ) : null}
    </span>
  );
}

function AvatarImage({src, alt}: {src: string; alt: string}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className="absolute inset-0 size-full object-cover"
    />
  );
}
