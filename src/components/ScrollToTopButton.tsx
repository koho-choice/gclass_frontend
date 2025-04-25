// ScrollToTopButton.tsx
import React from "react";

const ScrollToTopButton: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      onClick={scrollToTop}
      style={{
        position: "fixed",
        bottom: "5px",
        left: "20px",
        padding: "10px 15px",
        fontSize: "16px",
        backgroundColor: "#4A90E2",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
      }}
    >
      Scroll to Top
    </button>
  );
};

export default ScrollToTopButton;
