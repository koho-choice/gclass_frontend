// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { host } from "../config";
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
  getAccessToken: () => Promise<string | null>;
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

  const [accessToken, setAccessToken] = useState(() => {
    return localStorage.getItem("accessToken");
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem("refreshToken");
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

  // Update localStorage when tokens change
  useEffect(() => {
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    } else {
      localStorage.removeItem("refreshToken");
    }
  }, [refreshToken]);

  // Function to check if the token is expired
  const isTokenExpired = (token: string): boolean => {
    const decoded: { exp: number } = jwtDecode(token);
    const now = Date.now().valueOf() / 1000;
    return decoded.exp < now;
  };

  // Function to refresh the access token
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${host}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return data.access_token;
    } catch (error) {
      console.error("Error refreshing token:", error);
      setIsAuthenticated(false);
      return null;
    }
  };

  // Function to get the current access token, refreshing it if necessary
  const getAccessToken = async (): Promise<string | null> => {
    if (accessToken && !isTokenExpired(accessToken)) {
      return accessToken;
    }
    return await refreshAccessToken();
  };

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
        getAccessToken,
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
