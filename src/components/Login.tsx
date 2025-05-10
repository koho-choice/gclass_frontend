import React, { useState } from "react";
import Modal from "react-modal";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../context/AuthContext";

import { host, getJwtToken } from "../config";

// Set the app element for accessibility
Modal.setAppElement("#root");

// Define custom styles for the modal
const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    width: "80%",
    maxWidth: "400px",
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.75)",
  },
};

const Login = () => {
  const { setIsAuthenticated, setUser, setPlatform, fetchSubscriptionStatus } =
    useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<
    "classroom" | "canvas" | "manual" | null
  >(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

      // Store the JWT token in sessionStorage
      sessionStorage.setItem("jwtToken", data.token);
      fetchSubscriptionStatus();
      setIsAuthenticated(true);
      setUser({
        name: data.user.name,
        email: data.user.email,
      });
    } catch (error) {
      console.error("Error sending authorization code to backend:", error);
      setErrorMessage("An error occurred during login. Please try again.");
      setModalIsOpen(true);
    }
  };

  const login = useGoogleLogin({
    flow: "auth-code",
    scope: "openid profile email ",
    // "https://www.googleapis.com/auth/classroom.courses " +
    // "https://www.googleapis.com/auth/classroom.rosters " +
    // "https://www.googleapis.com/auth/classroom.coursework.students " +
    // "https://www.googleapis.com/auth/classroom.coursework.me " +
    //"https://www.googleapis.com/auth/drive.readonly ",
    // "https://www.googleapis.com/auth/classroom.profile.emails ",
    onSuccess: handleLoginSuccess,
    onError: (error) => {
      console.log("Login Failed", error);
      setErrorMessage("An error occurred during login. Please try again.");
      setModalIsOpen(true);
    },
  });

  const handlePlatformToggle = (
    platform: "classroom" | "canvas" | "manual"
  ) => {
    setSelectedPlatform(platform);
    setPlatform(platform);
    sessionStorage.setItem("platform", platform);
    login();
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="flex space-x-4">
        {/* 
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
        */}
        <button
          onClick={() => handlePlatformToggle("manual")}
          className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white ${
            selectedPlatform === "manual" ? "bg-gray-700" : "bg-gray-600"
          } hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200 shadow-sm hover:shadow-md`}
        >
          Sign In
        </button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        contentLabel="Error Modal"
        style={customStyles}
      >
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p className="mb-4">{errorMessage}</p>
        <button
          onClick={() => setModalIsOpen(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default Login;
