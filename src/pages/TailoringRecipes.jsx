// src/pages/TailoringRecipes.jsx
import { useState } from "react";
import { TAILORING_RECIPES, enrichRecipeWithMaterialNames } from "../data/tailoringRecipes";

export default function TailoringRecipes() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(
    TAILORING_RECIPES[0]?.id || ""
  );
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const selectedRecipe = enrichRecipeWithMaterialNames(
    TAILORING_RECIPES.find((r) => r.id === selectedRecipeId)
  );

  const calculateCost = async () => {
    if (!selectedRecipeId) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/craft-cost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: selectedRecipeId,
          stats: {
            multicraftChance: 0,
            resourcefulnessChance: 0,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Greška pri izračunu cijene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "900px" }}>
      <h1>Tailoring recepti – cost kalkulator</h1>

      {/* Odabir recepta */}
      <div style={{ marginBottom: "1rem" }}>
        <label>
          Recept:&nbsp;
          <select
            value={selectedRecipeId}
            onChange={(e) => setSelectedRecipeId(e.target.value)}
          >
            {TAILORING_RECIPES.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={calculateCost}
          style={{ marginLeft: "1rem", padding: "0.5rem 1rem" }}
        >
          Izračunaj cost
        </button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Računam...</p>}

      {/* Rezultat */}
      {result && (
        <div style={{ marginTop: "1.5rem" }}>
          <h2>{result.recipeName}</h2>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "1rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                  Materijal
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Količina
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Cijena / kom (g)
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Ukupno (g)
                </th>
              </tr>
            </thead>
            <tbody>
              {result.materials.map((m) => (
                <tr key={m.materialId}>
                  <td>{m.name}</td>
                  <td style={{ textAlign: "right" }}>{m.quantity}</td>
                  <td style={{ textAlign: "right" }}>
                    {m.unitPriceGold.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {m.totalGold.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p>
            <strong>Ukupan cost po craftu:</strong>{" "}
            {result.totalCostGold.toFixed(2)} g
          </p>
          <p>
            <strong>Effective cost (sa statsima):</strong>{" "}
            {result.effectiveCostGold.toFixed(2)} g
          </p>
        </div>
      )}
    </div>
  );
}