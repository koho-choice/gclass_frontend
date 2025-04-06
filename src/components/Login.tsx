import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";
import { LogIn } from "lucide-react";
import { host } from "../config";

const Login = () => {
  const { setIsAuthenticated, setUser, setPlatform } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<
    "classroom" | "canvas" | null
  >(null);

  const handleLoginSuccess = async (codeResponse: any) => {
    console.log("Authorization Code:", codeResponse.code);
    try {
      const res = await fetch(`${host}/auth/google/code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeResponse.code }),
      });

      const data = await res.json();
      console.log("Backend Response name:", data);
      setIsAuthenticated(true);
      setUser({
        name: data.user.name,
        email: data.user.email,
      });
    } catch (error) {
      console.error("Error sending authorization code to backend:", error);
    }
  };

  const login = useGoogleLogin({
    flow: "auth-code",
    scope:
      "openid profile email https://www.googleapis.com/auth/classroom.courses https://www.googleapis.com/auth/classroom.rosters https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.coursework.me https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/classroom.profile.emails ",
    onSuccess: handleLoginSuccess,
    onError: (error) => console.log("Login Failed", error),
  });

  const handlePlatformToggle = (platform: "classroom" | "canvas") => {
    setSelectedPlatform(platform);
    setPlatform(platform);
    localStorage.setItem("platform", platform);
    login();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-4">
        <button
          onClick={() => handlePlatformToggle("classroom")}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
            selectedPlatform === "classroom" ? "bg-blue-700" : "bg-blue-600"
          } hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md`}
        >
          Google Classroom
        </button>
        <button
          onClick={() => handlePlatformToggle("canvas")}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
            selectedPlatform === "canvas" ? "bg-green-700" : "bg-green-600"
          } hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 shadow-sm hover:shadow-md`}
        >
          Canvas
        </button>
      </div>
    </div>
  );
};

export default Login;
