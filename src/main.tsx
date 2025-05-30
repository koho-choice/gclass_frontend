import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.tsx";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { GlobalWorkerOptions } from "pdfjs-dist";
// In Vite, public/ assets are served from `import.meta.env.BASE_URL`
GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// your Stripe publishable key:
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <StrictMode>
      <GoogleOAuthProvider clientId={clientId}>
        <Elements stripe={stripePromise}>
          <App />
        </Elements>
      </GoogleOAuthProvider>
    </StrictMode>
  </AuthProvider>
);
