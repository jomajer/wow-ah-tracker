// src/pages/MidnightTailoring.jsx
import { useEffect, useState } from "react";
import * as XLSX from "xlsx";

export default function MidnightTailoring() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMaterials = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/midnight-materials");
      if (!res.ok) throw new Error("API error");
      const data = await res.json();
      setMaterials(data.materials || []);
    } catch (e) {
      setError("Greška pri dohvatu materijala.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const exportToExcel = () => {
    if (!materials.length) return;

    const ws = XLSX.utils.json_to_sheet(
      materials.map((m) => ({
        Material: m.name,
        Source: m.source === "vendor" ? "Vendor" : "AH",
        "Min price (gold)": m.minPriceGold ?? "",
        "Total quantity": m.totalQuantity ?? "",
        "Auction count": m.auctionCount ?? "",
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Midnight Tailoring");
    XLSX.writeFile(wb, "midnight_tailoring_materials.xlsx");
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px" }}>
      <h1>🧵 Midnight Tailoring materijali</h1>

      {loading && <p>⏳ Učitavam podatke...</p>}
      {error && <p style={{ color: "red" }}>❌ {error}</p>}

      <button onClick={fetchMaterials} style={{ marginBottom: "1rem", marginRight: "1rem" }}>
        🔄 Osvježi
      </button>
      <button onClick={exportToExcel}>
        📥 Export u Excel
      </button>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Material</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>Source</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Min price (g)</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Total qty</th>
            <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>Auction count</th>
          </tr>
        </thead>
        <tbody>
          {materials.map((m) => (
            <tr key={m.id}>
              <td>{m.name}</td>
              <td>{m.source === "vendor" ? "Vendor" : "AH"}</td>
              <td style={{ textAlign: "right" }}>
                {m.minPriceGold != null ? `${m.minPriceGold}g` : "-"}
              </td>
              <td style={{ textAlign: "right" }}>
                {m.totalQuantity != null ? m.totalQuantity.toLocaleString() : "-"}
              </td>
              <td style={{ textAlign: "right" }}>
                {m.auctionCount != null ? m.auctionCount : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}