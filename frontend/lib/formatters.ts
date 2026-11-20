const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

const readableDateFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
});

const readableDateTimeFormatter = new Intl.DateTimeFormat("en-PH", {
  dateStyle: "medium",
  timeStyle: "short",
});

export const formatCurrency = (value: number | string) => {
  return pesoFormatter.format(Number(value) || 0);
};

export const formatReadableDate = (value?: string | Date | null) => {
  if (!value) {
    return "Not set";
  }

  return readableDateFormatter.format(new Date(value));
};

export const formatReadableDateTime = (value?: string | Date | null) => {
  if (!value) {
    return "Not set";
  }

  return readableDateTimeFormatter.format(new Date(value));
};

export const formatStatusLabel = (
  value?: string | null,
  type?: "purchase" | "rent",
) => {
  if (!value) {
    return "Not set";
  }

  const normalized = value.trim().toLowerCase();

  if (!normalized) {
    return "Not set";
  }

  if (normalized === "ready") {
    return type === "purchase" ? "Ready for fitting" : "Ready for fitting";
  }

  if (normalized === "received") {
    return "Received";
  }

  if (normalized === "active") {
    return "Outfit held by customer";
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};
