"use client";
import {createContext, useContext} from "react";
import {IUser} from "../types/IUser";

export interface IAuthContext {
  user: IUser | null;
  isAuthenticated: boolean;
  setAuthenticated: (value: boolean) => void;
  isLoading: boolean;
  setUser: (user: IUser | null) => void;
}

export const AuthContext = createContext<IAuthContext | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
