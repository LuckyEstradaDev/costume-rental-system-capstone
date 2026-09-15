import { createContext } from "react";

export const PackageContext = createContext<any>(undefined);

export function PackageProvider({ children }: { children: React.ReactNode }) {
  return <PackageContext.Provider value={}>{children}</PackageContext.Provider>;
}
