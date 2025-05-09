// src/pages/CancelPage.tsx
import { Link } from "react-router-dom";

const Cancel: React.FC = () => (
  <div style={{ padding: 24 }}>
    <h1>Subscription Canceled</h1>
    <p>
      You didn’t complete payment. <Link to="/">Try again</Link>.
    </p>
  </div>
);

export default Cancel;
