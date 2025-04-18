// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

// Define platform type
export type Platform = "classroom" | "canvas" | undefined;

// Define the shape of the user object
interface User {
  name: string;
  email: string;
}

// Define the shape of the authentication context
interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  user?: User;
  setUser: (user: User | undefined) => void;
  platform?: Platform;
  setPlatform: (platform: Platform) => void;
}

// Create the authentication context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap around parts of the app that need access to authentication state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from localStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("isAuthenticated") === "true";
  });

  const [user, setUser] = useState<User | undefined>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : undefined;
  });

  // Add platform state
  const [platform, setPlatform] = useState<Platform>(() => {
    return (localStorage.getItem("platform") as Platform) || undefined;
  });

  // Update localStorage when auth state changes
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  // Update localStorage when user data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  // Update localStorage when platform changes
  useEffect(() => {
    if (platform) {
      localStorage.setItem("platform", platform);
    } else {
      localStorage.removeItem("platform");
    }
  }, [platform]);

  return (
    // Provide the authentication state and setter function to the context
    <AuthContext.Provider
      value={{
        isAuthenticated,
        setIsAuthenticated,
        user,
        setUser,
        platform,
        setPlatform,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the authentication context
export const useAuth = (): AuthContextType => {
  // Get the context value
  const context = useContext(AuthContext);
  // Throw an error if the hook is used outside of an AuthProvider
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
