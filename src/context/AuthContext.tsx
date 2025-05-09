// AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";
import { host, getJwtToken } from "../config";
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
  subMessage: string | null;
  fetchSubscriptionStatus: () => Promise<void>;
}

// Create the authentication context with an undefined default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to wrap around parts of the app that need access to authentication state
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Initialize state from sessionStorage
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("isAuthenticated") === "true";
  });

  const [user, setUser] = useState<User | undefined>(() => {
    const savedUser = sessionStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : undefined;
  });

  const [accessToken, setAccessToken] = useState(() => {
    return sessionStorage.getItem("accessToken");
  });

  const [refreshToken, setRefreshToken] = useState(() => {
    return sessionStorage.getItem("refreshToken");
  });

  // Add platform state
  const [platform, setPlatform] = useState<Platform>(() => {
    return (sessionStorage.getItem("platform") as Platform) || undefined;
  });
  const [subMessage, setSubMessage] = useState<string | null>(null);

  // Update sessionStorage when auth state changes
  useEffect(() => {
    sessionStorage.setItem("isAuthenticated", isAuthenticated.toString());
  }, [isAuthenticated]);

  // Update sessionStorage when user data changes
  useEffect(() => {
    if (user) {
      sessionStorage.setItem("user", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("user");
    }
  }, [user]);

  // Update sessionStorage when platform changes
  useEffect(() => {
    if (platform) {
      sessionStorage.setItem("platform", platform);
    } else {
      sessionStorage.removeItem("platform");
    }
  }, [platform]);

  // Update sessionStorage when tokens change
  useEffect(() => {
    if (accessToken) {
      sessionStorage.setItem("accessToken", accessToken);
    } else {
      sessionStorage.removeItem("accessToken");
    }
  }, [accessToken]);

  useEffect(() => {
    if (refreshToken) {
      sessionStorage.setItem("refreshToken", refreshToken);
    } else {
      sessionStorage.removeItem("refreshToken");
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
  const fetchSubscriptionStatus = async (): Promise<void> => {
    console.log("Fetching subscription status...");
    const jwt_token = getJwtToken();

    if (!jwt_token) return;

    try {
      const res = await fetch(`${host}/billing/check_subscription`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwt_token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const { message } = await res.json();
      console.log("Sub message is about to be set", message);
      setSubMessage(message);
      sessionStorage.setItem("subMessage", message);
      return message;
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
    }
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
        subMessage,
        fetchSubscriptionStatus,
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
