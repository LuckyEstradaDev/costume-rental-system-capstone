const currencyFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const measurementFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

export function formatPackagePrice(value: number) {
  return currencyFormatter.format(value);
}

export function formatPackageMeasurement(value: number) {
  return measurementFormatter.format(value);
}
