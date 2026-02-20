// src/components/ItemPrice.jsx
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

export default function ItemPrice() {
  const { itemId } = useParams();          // novo
  const effectiveItemId = itemId || "210810"; // default Arathor's Spear


  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState("");
  const [alertActive, setAlertActive] = useState(false);
  const [lastAlert, setLastAlert] = useState(null);
  const intervalRef = useRef(null);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/wow-proxy?itemId=${effectiveItemId}`);
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setPrice(data);
      checkAlert(data);
    } catch (e) {
      setError("Greška pri dohvatu podataka.");
    } finally {
      setLoading(false);
    }
  };

  const checkAlert = (data) => {
    if (!alertActive || !threshold || !data?.top5Prices?.length) return;
    const minPrice = data.top5Prices[0].priceGold;
    if (minPrice <= parseFloat(threshold)) {
      sendNotification(minPrice);
    }
  };

  const sendNotification = (p) => {
    if (Notification.permission === "granted") {
      new Notification("🪙 WoW AH Price Alert!", {
        body: `Item ${effectiveItemId} je pao na ${p}g!`,
      });
      setLastAlert(new Date().toLocaleTimeString());
    }
  };

  const requestPermissionAndActivate = async () => {
    if (!threshold || isNaN(parseFloat(threshold))) {
      alert("Upiši valjani prag cijene u gold!");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      setAlertActive(true);
    } else {
      alert("Moraš dozvoliti notifikacije u browseru!");
    }
  };

  const stopAlert = () => {
    setAlertActive(false);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    if (alertActive) {
      fetchPrice();
      intervalRef.current = setInterval(fetchPrice, 5 * 60 * 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertActive, effectiveItemId]);

  useEffect(() => {
    fetchPrice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveItemId]);

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "600px" }}>
      <h1>🪙 WoW AH Price Tracker</h1>
      <h2>Item ID: {effectiveItemId}</h2>

      {loading && <p>⏳ Učitavam podatke...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      {price && (
        <div style={{ background: "#1a1a2e", color: "#FFD700", padding: "1rem", borderRadius: "8px" }}>
          <h3>Top 5 najmanjih cijena</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", paddingBottom: "0.5rem" }}>#</th>
                <th style={{ textAlign: "left" }}>Cijena (gold)</th>
                <th style={{ textAlign: "left" }}>Količina</th>
              </tr>
            </thead>
            <tbody>
              {price.top5Prices.map((entry, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>💰 {entry.priceGold}g</td>
                  <td>📦 {entry.quantity.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <hr style={{ borderColor: "#FFD700", margin: "0.75rem 0" }} />
          <p>🏷️ Ukupno aukcija: <strong>{price.auctionCount}</strong></p>
          <p>📦 Ukupna količina: <strong>{price.totalQuantity.toLocaleString()}</strong></p>
        </div>
      )}

      <button onClick={fetchPrice} style={{ marginTop: "1rem", padding: "0.5rem 1rem" }}>
        🔄 Osvježi
      </button>

      <div style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
        <h3>🔔 Price Alert</h3>
        <p style={{ fontSize: "0.9rem", color: "#666" }}>
          Obavijesti me kad cijena padne ispod:
        </p>
        <input
          type="number"
          placeholder="npr. 500"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          style={{ padding: "0.5rem", width: "150px", marginRight: "0.5rem" }}
        />
        <span>gold</span>

        <div style={{ marginTop: "1rem" }}>
          {!alertActive ? (
            <button
              onClick={requestPermissionAndActivate}
              style={{ padding: "0.5rem 1rem", background: "#4CAF50", color: "white",
                       border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              ✅ Aktiviraj alert
            </button>
          ) : (
            <button
              onClick={stopAlert}
              style={{ padding: "0.5rem 1rem", background: "#f44336", color: "white",
                       border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
              ⛔ Zaustavi alert
            </button>
          )}
        </div>

        {alertActive && (
          <p style={{ color: "green", marginTop: "0.5rem" }}>
            ✅ Alert aktivan — provjera svakih 5 minuta (prag: {threshold}g)
          </p>
        )}
        {lastAlert && (
          <p style={{ color: "#666", fontSize: "0.85rem" }}>
            Zadnji alert poslan: {lastAlert}
          </p>
        )}
      </div>
    </div>
  );
}