"use client";
import {useEffect, useState} from "react";
import {AuthContext} from "../hooks/useAuth";
import type {IUser} from "../types/IUser";
import {sessionAuthenticationService} from "../services/authService";
import {usePathname} from "next/navigation";

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isAuthModalOpen, openAuthModal] = useState<boolean>(false);
  const pathname = usePathname();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!isAuthenticated && pathname == "/dashboard/browse") {
        setIsAuthorized(true);
        setLoading(false);
        return;
      }
      try {
        const {data} = await sessionAuthenticationService();
        setUser(data.user);
        setAuthenticated(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.log(error.response.data.message);
        setUser(null);
        setAuthenticated(false);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        setAuthenticated,
        setUser,
        isLoading,
        isAuthorized,
        openAuthModal,
        isAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
