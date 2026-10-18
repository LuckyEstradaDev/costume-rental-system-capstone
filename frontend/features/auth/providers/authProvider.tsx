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
    let isActive = true;

    const fetchData = async () => {
      setLoading(true);

      try {
        const {data} = await sessionAuthenticationService();

        if (!isActive) return;

        setUser(data.user);
        setAuthenticated(true);
      } catch (error: unknown) {
        if (!isActive) return;

        const message =
          error instanceof Error ? error.message : "Session check failed";

        console.log(message);

        setUser(null);
        setAuthenticated(false);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isActive = false;
    };
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
