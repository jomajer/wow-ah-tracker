// api/craft-cost-all.js
import MIDNIGHTTAILORINGMATERIALS from "../midnightTailoringMaterials.js";
import { TAILORING_RECIPES } from "../src/data/tailoringRecipes";

const RESOURCEFULNESS_REFUND_FACTOR = 0.3;
const MULTICRAFT_EXTRA_FACTOR = 1.5;

function findMaterialDef(id) {
  return MIDNIGHTTAILORINGMATERIALS.find((m) => m.id === id);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { stats } = req.body || {};
    const skill = Number(stats?.skill ?? 0);
    const multicraftChance = Number(stats?.multicraftChance ?? 0); // 0–1
    const resourcefulnessChance = Number(stats?.resourcefulnessChance ?? 0); // 0–1

    // 1) Dohvati cijene svih materijala iz postojećeg endpointa
    const materialsRes = await fetch("/api/midnight-materials");
    if (!materialsRes.ok) {
      throw new Error("Failed to fetch materials prices");
    }
    const materialsData = await materialsRes.json();
    const prices = materialsData.materials || [];

    const priceById = (materialId) =>
      prices.find((m) => m.id === materialId || m.materialId === materialId);

    const recipesResult = TAILORING_RECIPES.map((recipe) => {
      const baseOutput = recipe.outputQuantity || 1;

      // 2) Osnovni cost materijala
      let baseCostGold = 0;
      const matsDetail = recipe.materials.map((m) => {
        const priceEntry = priceById(m.materialId);
        const unitPriceGold = priceEntry?.minPriceGold
          ? parseFloat(priceEntry.minPriceGold)
          : 0;
        const totalGold = unitPriceGold * m.quantity;
        baseCostGold += totalGold;

        const def = findMaterialDef(m.materialId);

        return {
          materialId: m.materialId,
          name: def?.name || priceEntry?.name || `Item ${m.materialId}`,
          quantity: m.quantity,
          unitPriceGold,
          totalGold,
        };
      });

      // 3) Resourcefulness – očekivana ušteda
      const refundGold =
        baseCostGold * resourcefulnessChance * RESOURCEFULNESS_REFUND_FACTOR;
      const costAfterResourcefulnessGold = baseCostGold - refundGold;

      // 4) Multicraft – očekivani dodatni output
      const expectedExtraOutput = baseOutput * multicraftChance * MULTICRAFT_EXTRA_FACTOR;
      const totalExpectedOutput = baseOutput + expectedExtraOutput;

      // 5) Effective cost po itemu
      const effectiveCostPerItemGold =
        totalExpectedOutput > 0
          ? costAfterResourcefulnessGold / totalExpectedOutput
          : costAfterResourcefulnessGold;

      // 6) Tekst formule
      const formulaText = [
        `C_bruto = Σ (količina_i × cijena_i) = ${baseCostGold.toFixed(2)} g`,
        `refund = C_bruto × R × S_R = ${baseCostGold.toFixed(
          2
        )} × ${resourcefulnessChance.toFixed(2)} × ${RESOURCEFULNESS_REFUND_FACTOR.toFixed(
          2
        )} = ${refundGold.toFixed(2)} g`,
        `C_res = C_bruto − refund = ${costAfterResourcefulnessGold.toFixed(2)} g`,
        `Q_extra = Q_base × M × F_M = ${baseOutput} × ${multicraftChance.toFixed(
          2
        )} × ${MULTICRAFT_EXTRA_FACTOR.toFixed(2)} = ${expectedExtraOutput.toFixed(
          2
        )}`,
        `Q_total = Q_base + Q_extra = ${totalExpectedOutput.toFixed(2)}`,
        `C_item = C_res / Q_total = ${effectiveCostPerItemGold.toFixed(2)} g`,
      ].join(" | ");

      return {
        id: recipe.id,
        name: recipe.name,
        outputQuantity: baseOutput,
        materials: matsDetail,
        cost: {
          baseCostGold,
          refundGold,
          costAfterResourcefulnessGold,
          expectedExtraOutput,
          totalExpectedOutput,
          effectiveCostPerItemGold,
          formulaText,
        },
      };
    });

    res.status(200).json({
      stats: { skill, multicraftChance, resourcefulnessChance },
      recipes: recipesResult,
    });
  } catch (err) {
    console.error("craft-cost-all error", err);
    res.status(500).json({ error: err.message });
  }
}