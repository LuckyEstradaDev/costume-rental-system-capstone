export interface AddressLevel {
  code: string;
  name: string;
}

export interface UserAddress {
  region: AddressLevel;
  cityMunicipality: AddressLevel;
  barangay: AddressLevel;
  province?: AddressLevel;
  street?: string;
  postalCode?: string;
}

export interface AddressFormValue {
  region?: AddressLevel;
  province?: AddressLevel;
  cityMunicipality?: AddressLevel;
  barangay?: AddressLevel;
  street?: string;
  postalCode?: string;
}

export interface PsgcRegion {
  code: string;
  name: string;
}

export interface PsgcProvince {
  code: string;
  name: string;
  regionCode: string;
}

export interface PsgcCity {
  code: string;
  name: string;
  provinceCode: string;
  regionCode: string;
  isCity: boolean;
}

export interface PsgcBarangay {
  code: string;
  name: string;
  cityCode: string;
}

export interface PsgcData {
  regions: PsgcRegion[];
  provinces: PsgcProvince[];
  cities: PsgcCity[];
  barangays: PsgcBarangay[];
}
