import { createContext, useContext, useState, ReactNode } from "react";
import { allTestUsers } from "../data/test-users";

export type UserRole = "customer" | "staff" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  nationality?: string;
  documentId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
  }) => boolean;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Array para almacenar usuarios registrados en localStorage
const getRegisteredUsers = () => {
  const stored = localStorage.getItem("vinihotel_registered_users");
  return stored ? JSON.parse(stored) : [];
};

const saveRegisteredUsers = (users: any[]) => {
  localStorage.setItem("vinihotel_registered_users", JSON.stringify(users));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("vinihotel_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (email: string, password: string): boolean => {
    // Primero buscar en usuarios de prueba
    let foundUser = allTestUsers.find(
      (u) => u.email === email && u.password === password
    );

    // Si no encuentra en prueba, buscar en usuarios registrados
    if (!foundUser) {
      const registeredUsers = getRegisteredUsers();
      foundUser = registeredUsers.find(
        (u: any) => u.email === email && u.password === password
      );
    }

    if (foundUser) {
      const userData: User = {
        id: `user-${Date.now()}`,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        address: foundUser.address,
        dateOfBirth: foundUser.dateOfBirth,
      };
      setUser(userData);
      localStorage.setItem("vinihotel_user", JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
    dateOfBirth?: string;
  }): boolean => {
    // Verificar si el email ya existe en usuarios de prueba
    const existsInTestUsers = allTestUsers.find((u) => u.email === data.email);
    if (existsInTestUsers) {
      return false;
    }

    // Verificar si el email ya existe en usuarios registrados
    const registeredUsers = getRegisteredUsers();
    const existsInRegistered = registeredUsers.find(
      (u: any) => u.email === data.email
    );
    if (existsInRegistered) {
      return false;
    }

    // Crear nuevo usuario
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      password: data.password,
      role: "customer" as const,
      phone: data.phone || "",
      address: data.address || "",
      dateOfBirth: data.dateOfBirth || "",
    };

    // Guardar usuario registrado
    registeredUsers.push(newUser);
    saveRegisteredUsers(registeredUsers);

    // Iniciar sesión automáticamente
    const userData: User = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      address: newUser.address,
      dateOfBirth: newUser.dateOfBirth,
    };
    setUser(userData);
    localStorage.setItem("vinihotel_user", JSON.stringify(userData));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("vinihotel_user");
  };

  const updateProfile = (updates: Partial<User>) => {
    setUser((current) => {
      if (!current) return null;
      const updated = { ...current, ...updates };
      localStorage.setItem("vinihotel_user", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}