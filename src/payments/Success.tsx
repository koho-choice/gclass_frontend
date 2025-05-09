// src/pages/SuccessPage.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { host } from "../config";
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Success: React.FC = () => {
  const query = useQuery();
  const sessionId = query.get("session_id");
  const [message, setMessage] = useState("Verifying your subscription…");

  useEffect(() => {
    if (!sessionId) return setMessage("No session ID provided.");
    fetch(`${host}/checkout/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.subscriptionStatus === "active") {
          setMessage("🎉 You’re now on Premium! Welcome aboard.");
        } else if (data.subscriptionStatus === "trialing") {
          setMessage("✅ Your trial has started! Enjoy the next 14 days.");
        } else {
          setMessage("Something’s off—please contact support.");
        }
      })
      .catch(() => setMessage("Error verifying session."));
  }, [sessionId]);

  return (
    <div style={{ padding: 24 }}>
      <h1>Subscription Status</h1>
      <p>{message}</p>
    </div>
  );
};

export default Success;
