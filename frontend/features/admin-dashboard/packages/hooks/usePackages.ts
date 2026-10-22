import {useQuery} from "@tanstack/react-query";
import {fetchPackagesService} from "../services/PackageService";

/**
 * The package list is shared by the inventory, the browse grid and the order
 * views, so it is fetched under one query key and served from the cache.
 */
export const usePackages = () =>
  useQuery({
    queryKey: ["packages"],
    queryFn: fetchPackagesService,
  });
