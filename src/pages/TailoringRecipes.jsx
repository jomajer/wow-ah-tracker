// src/pages/TailoringRecipes.jsx
import { useState } from "react";
import { TAILORING_RECIPES } from "../data/tailoringRecipes";

export default function TailoringRecipes() {
  const [skill, setSkill] = useState(0);
  const [multicraft, setMulticraft] = useState(0); // %
  const [resourcefulness, setResourcefulness] = useState(0); // %
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateAll = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/craft-cost-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stats: {
            skill: Number(skill) || 0,
            multicraftChance: (Number(multicraft) || 0) / 100,
            resourcefulnessChance: (Number(resourcefulness) || 0) / 100,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("API error");
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Greška pri izračunu recepata.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "1200px" }}>
      <h1>Tailoring recepti – cost za sve recepte</h1>

      {/* Input zona za statse */}
      <div
        style={{
          marginBottom: "1rem",
          padding: "1rem",
          border: "1px solid #ccc",
          borderRadius: "8px",
        }}
      >
        <h2>Statovi lika</h2>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label>
            Skill:&nbsp;
            <input
              type="number"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              style={{ width: "80px" }}
            />
          </label>
          <label>
            Multicraft (%):&nbsp;
            <input
              type="number"
              value={multicraft}
              onChange={(e) => setMulticraft(e.target.value)}
              style={{ width: "80px" }}
            />
          </label>
          <label>
            Resourcefulness (%):&nbsp;
            <input
              type="number"
              value={resourcefulness}
              onChange={(e) => setResourcefulness(e.target.value)}
              style={{ width: "80px" }}
            />
          </label>
          <button
            onClick={calculateAll}
            style={{ padding: "0.5rem 1rem", marginLeft: "auto" }}
          >
            Izračunaj sve recepte
          </button>
        </div>
        <p style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
          Skill je zasad informativan (utječe na kvalitetu, ne na cost), multicraft i
          resourcefulness utječu na očekivani cost po itemu.
        </p>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Računam...</p>}

      {/* Tablica svih recepata */}
      {result && (
        <div style={{ marginTop: "1rem" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "1rem",
              fontSize: "0.9rem",
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                  Recept
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Base cost (g)
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Cost nakon Resourcefulness (g)
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Očekivani output
                </th>
                <th style={{ textAlign: "right", borderBottom: "1px solid #ccc" }}>
                  Effective cost / item (g)
                </th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ccc" }}>
                  Formula
                </th>
              </tr>
            </thead>
            <tbody>
              {result.recipes.map((r) => (
                <tr key={r.id}>
                  <td style={{ padding: "0.25rem 0" }}>{r.name}</td>
                  <td style={{ textAlign: "right" }}>
                    {r.cost.baseCostGold.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {r.cost.costAfterResourcefulnessGold.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {r.cost.totalExpectedOutput.toFixed(2)}
                  </td>
                  <td style={{ textAlign: "right" }}>
                    {r.cost.effectiveCostPerItemGold.toFixed(2)}
                  </td>
                  <td style={{ paddingLeft: "0.5rem" }}>{r.cost.formulaText}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ako još nisi dodao recepte, barem prikaži da ih nema */}
      {!loading && !result && TAILORING_RECIPES.length === 0 && (
        <p>Još nema definiranih tailoring recepata.</p>
      )}
    </div>
  );
}