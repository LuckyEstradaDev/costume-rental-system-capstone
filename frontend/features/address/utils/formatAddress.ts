import type {AddressFormValue, UserAddress} from "../types";

export const formatAddress = (
  address?: UserAddress | null,
): string => {
  if (!address) {
    return "";
  }

  const parts = [
    address.street,
    address.barangay?.name,
    address.cityMunicipality?.name,
    address.province?.name,
    address.region?.name,
  ].filter((part): part is string => Boolean(part && part.trim()));

  const line = parts.join(", ");

  if (!address.postalCode) {
    return line;
  }

  return line ? `${line} ${address.postalCode}` : address.postalCode;
};

export const isAddressIncomplete = (value: AddressFormValue): boolean => {
  const started = Boolean(
    value.region ||
      value.province ||
      value.cityMunicipality ||
      value.barangay ||
      value.street?.trim() ||
      value.postalCode?.trim(),
  );

  if (!started) {
    return false;
  }

  return !value.region || !value.cityMunicipality || !value.barangay;
};

export const toUserAddress = (
  value: AddressFormValue,
): UserAddress | null => {
  if (isAddressIncomplete(value)) {
    return null;
  }

  if (!value.region || !value.cityMunicipality || !value.barangay) {
    return null;
  }

  return {
    region: value.region,
    cityMunicipality: value.cityMunicipality,
    barangay: value.barangay,
    ...(value.province ? {province: value.province} : {}),
    ...(value.street?.trim() ? {street: value.street.trim()} : {}),
    ...(value.postalCode?.trim() ? {postalCode: value.postalCode.trim()} : {}),
  };
};
