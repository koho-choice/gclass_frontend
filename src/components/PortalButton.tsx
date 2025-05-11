// src/components/CheckoutButton.tsx
import React, { useState } from "react";
import { host, getJwtToken } from "../config";
interface CreateSessionResponse {
  sessionId: string;
}

const PortalButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const jwtToken = getJwtToken(); // however you grab your JWT
  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${host}/billing/portal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (!res.ok) {
        const text = await res.text();
        console.error("Portal error:", text);
        return;
      }
      const { url }: { url: string } = await res.json();
      // Redirect the browser straight to the Stripe‑hosted portal
      window.open(url, "_blank");
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handlePortal} disabled={loading}>
      {loading ? "Loading…" : "Manage Subscription"}
    </button>
  );
};

export default PortalButton;
