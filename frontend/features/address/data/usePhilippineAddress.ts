"use client";

import * as React from "react";

import type {PsgcData} from "../types";

let cache: PsgcData | null = null;
let pending: Promise<PsgcData> | null = null;

const loadPsgc = (): Promise<PsgcData> => {
  if (cache) {
    return Promise.resolve(cache);
  }

  if (!pending) {
    pending = fetch("/data/psgc.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load address data.");
        }

        return response.json() as Promise<PsgcData>;
      })
      .then((data) => {
        cache = data;
        return data;
      })
      .finally(() => {
        pending = null;
      });
  }

  return pending;
};

export const usePhilippineAddress = () => {
  const [data, setData] = React.useState<PsgcData | null>(cache);
  const [isLoading, setIsLoading] = React.useState(!cache);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (cache) {
      return;
    }

    let active = true;

    loadPsgc()
      .then((loaded) => {
        if (active) {
          setData(loaded);
          setError(null);
        }
      })
      .catch((loadError: unknown) => {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError
              : new Error("Failed to load address data."),
          );
        }
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return {data, isLoading, error};
};
