import React, { useState } from "react";

export default function Home() {
  const [amount, setAmount] = useState("1.00");
  const [description, setDescription] = useState("Donation");

  const handleCheckout = () => {
    const query = new URLSearchParams({
      amount,
      name: description,
    }).toString();
    window.location.href = `/api/checkout?${query}`;
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>GupShop</h1>
      <p>
      </p>
      <div style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <label>
          Amount (USD):
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </label>
        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
          />
        </label>
        <button
          onClick={handleCheckout}
          style={{
            padding: "0.75rem 1rem",
            backgroundColor: "#635bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Pay ${amount} (plus 7.5% fee)
        </button>
      </div>
    </div>
  );
}
