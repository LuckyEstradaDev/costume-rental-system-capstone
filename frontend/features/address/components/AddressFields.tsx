"use client";

import * as React from "react";

import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
  SearchSelect,
  type SearchSelectOption,
} from "@/components/ui/search-select";
import {usePhilippineAddress} from "../data/usePhilippineAddress";
import type {AddressFormValue, AddressLevel} from "../types";

interface AddressFieldsProps {
  value: AddressFormValue;
  onChange: (value: AddressFormValue) => void;
  disabled?: boolean;
  idPrefix?: string;
}

const toLevel = (level: {code: string; name: string}): AddressLevel => ({
  code: level.code,
  name: level.name,
});

export const AddressFields = ({
  value,
  onChange,
  disabled = false,
  idPrefix = "address",
}: AddressFieldsProps) => {
  const {data, isLoading, error} = usePhilippineAddress();

  const regionCode = value.region?.code ?? "";
  const provinceCode = value.province?.code ?? "";
  const cityCode = value.cityMunicipality?.code ?? "";
  const barangayCode = value.barangay?.code ?? "";

  const regions = data?.regions ?? [];

  const regionProvinces = React.useMemo(
    () =>
      data && regionCode
        ? data.provinces.filter((province) => province.regionCode === regionCode)
        : [],
    [data, regionCode],
  );

  const hasProvinces = regionProvinces.length > 0;

  const cities = React.useMemo(() => {
    if (!data) {
      return [];
    }

    if (provinceCode) {
      return data.cities.filter((city) => city.provinceCode === provinceCode);
    }

    if (regionCode) {
      return data.cities.filter(
        (city) => city.regionCode === regionCode && !city.provinceCode,
      );
    }

    return [];
  }, [data, provinceCode, regionCode]);

  const barangays = React.useMemo(
    () =>
      data && cityCode
        ? data.barangays.filter((barangay) => barangay.cityCode === cityCode)
        : [],
    [data, cityCode],
  );

  const regionOptions: SearchSelectOption[] = regions.map((region) => ({
    value: region.code,
    label: region.name,
  }));
  const provinceOptions: SearchSelectOption[] = regionProvinces.map(
    (province) => ({value: province.code, label: province.name}),
  );
  const cityOptions: SearchSelectOption[] = cities.map((city) => ({
    value: city.code,
    label: city.name,
  }));
  const barangayOptions: SearchSelectOption[] = barangays.map((barangay) => ({
    value: barangay.code,
    label: barangay.name,
  }));

  const cityDisabled = disabled || !regionCode || (hasProvinces && !provinceCode);
  const barangayDisabled = cityDisabled || !cityCode;

  const handleRegion = (code: string) => {
    const region = regions.find((item) => item.code === code);

    onChange({
      ...value,
      region: region ? toLevel(region) : undefined,
      province: undefined,
      cityMunicipality: undefined,
      barangay: undefined,
    });
  };

  const handleProvince = (code: string) => {
    const province = regionProvinces.find((item) => item.code === code);

    onChange({
      ...value,
      province: province ? toLevel(province) : undefined,
      cityMunicipality: undefined,
      barangay: undefined,
    });
  };

  const handleCity = (code: string) => {
    const city = cities.find((item) => item.code === code);

    onChange({
      ...value,
      cityMunicipality: city ? toLevel(city) : undefined,
      barangay: undefined,
    });
  };

  const handleBarangay = (code: string) => {
    const barangay = barangays.find((item) => item.code === code);

    onChange({
      ...value,
      barangay: barangay ? toLevel(barangay) : undefined,
    });
  };

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Unable to load address options. Please try again later.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-region`}>Region</Label>
        <SearchSelect
          id={`${idPrefix}-region`}
          value={regionCode}
          onChange={handleRegion}
          options={regionOptions}
          placeholder={isLoading ? "Loading..." : "Select region"}
          searchPlaceholder="Search region..."
          disabled={disabled || isLoading}
        />
      </div>

      {hasProvinces && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-province`}>Province</Label>
          <SearchSelect
            id={`${idPrefix}-province`}
            value={provinceCode}
            onChange={handleProvince}
            options={provinceOptions}
            placeholder="Select province"
            searchPlaceholder="Search province..."
            disabled={disabled || !regionCode}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-city`}>City / Municipality</Label>
        <SearchSelect
          id={`${idPrefix}-city`}
          value={cityCode}
          onChange={handleCity}
          options={cityOptions}
          placeholder="Select city or municipality"
          searchPlaceholder="Search city or municipality..."
          disabled={cityDisabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-barangay`}>Barangay</Label>
        <SearchSelect
          id={`${idPrefix}-barangay`}
          value={barangayCode}
          onChange={handleBarangay}
          options={barangayOptions}
          placeholder="Select barangay"
          searchPlaceholder="Search barangay..."
          disabled={barangayDisabled}
        />
      </div>

      <div className="space-y-2 sm:col-span-2">
        <Label htmlFor={`${idPrefix}-street`}>Street address</Label>
        <Input
          id={`${idPrefix}-street`}
          value={value.street ?? ""}
          onChange={(event) =>
            onChange({...value, street: event.target.value})
          }
          placeholder="House / unit no., street, subdivision"
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-postal`}>Postal code</Label>
        <Input
          id={`${idPrefix}-postal`}
          value={value.postalCode ?? ""}
          onChange={(event) =>
            onChange({...value, postalCode: event.target.value})
          }
          placeholder="e.g. 1100"
          inputMode="numeric"
          disabled={disabled}
        />
      </div>
    </div>
  );
};
