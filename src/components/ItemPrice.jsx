// src/components/ItemPrice.jsx
import { useState, useEffect } from "react";

const ITEMS = {
  "Arathor's Spear (Rank 3)": 210810,
};

export default function ItemPrice() {
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/wow-proxy?itemId=210810`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setPrice(data);
    } catch (e) {
      setError("Greška pri dohvatu podataka.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrice();
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>🪙 WoW AH Price Tracker</h1>
      <h2>Arathor's Spear (Rank 3)</h2>

      {loading && <p>⏳ Učitavam podatke s Blizzard API-a...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {price && (
        <div style={{ background: "#1a1a2e", color: "#FFD700", padding: "1rem", borderRadius: "8px" }}>
          <p>💰 Min. cijena: <strong>{price.minPriceGold}g</strong></p>
          <p>📦 Ukupna količina: <strong>{price.totalQuantity.toLocaleString()}</strong></p>
          <p>🏷️ Broj aukcija: <strong>{price.auctionCount}</strong></p>
        </div>
      )}

      <button onClick={fetchPrice} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        🔄 Osvježi
      </button>
    </div>
  );
}
