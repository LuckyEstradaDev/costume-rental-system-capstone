"use client";
import {useEffect, useState} from "react";
import {AuthContext} from "../hooks/useAuth";
import type {IUserRegistration} from "../types/IUser";
import {sessionAuthenticationService} from "../services/authService";

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [user, setUser] = useState<IUserRegistration | null>(null);
  const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
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
      value={{user, isAuthenticated, setAuthenticated, setUser, isLoading}}
    >
      {children}
    </AuthContext.Provider>
  );
};
