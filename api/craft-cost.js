// api/craft-cost.js
import { MIDNIGHTTAILORINGMATERIALS } from "../src/data/midnightTailoringMaterials";
import { getRecipeById } from "../src/data/tailoringRecipes";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { recipeId, stats } = req.body || {};

    const recipe = getRecipeById(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    // 1) Dohvati sve materijale iz Midnight endpointa (ili direktno Blizzard API)
    // Koristit ćemo postojeći midnight-materials endpoint da ne dupliciramo logiku
    const materialsRes = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/midnight-materials`
    );
    if (!materialsRes.ok) {
      throw new Error("Failed to fetch materials prices");
    }
    const materialsData = await materialsRes.json();
    const materialsPrices = materialsData.materials || [];

    // helper: nađi zapis za materijal po ID-u
    const findMatPrice = (materialId) =>
      materialsPrices.find((m) => m.id === materialId || m.materialId === materialId);

    // 2) Izračun osnovnog troška
    let totalCostGold = 0;
    const materialBreakdown = [];

    for (const m of recipe.materials) {
      const priceEntry = findMatPrice(m.materialId);
      const unitPriceGold = priceEntry?.minPriceGold
        ? parseFloat(priceEntry.minPriceGold)
        : 0;
      const totalGold = unitPriceGold * m.quantity;

      totalCostGold += totalGold;

      materialBreakdown.push({
        materialId: m.materialId,
        name: priceEntry?.name || `Item ${m.materialId}`,
        quantity: m.quantity,
        unitPriceGold,
        totalGold,
        source: priceEntry?.source || "ah",
      });
    }

    // 3) Stats – za sada minimalni (zanemarujemo multicraft/resourcefulness)
    const multicraftChance = stats?.multicraftChance ?? 0;
    const resourcefulnessChance = stats?.resourcefulnessChance ?? 0;

    const effectiveCostGold = totalCostGold; // kasnije ćemo umanjivati

    res.status(200).json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      outputQuantity: recipe.outputQuantity,
      materials: materialBreakdown,
      totalCostGold,
      effectiveCostGold,
      stats: {
        multicraftChance,
        resourcefulnessChance,
      },
    });
  } catch (err) {
    console.error("craft-cost error", err);
    res.status(500).json({ error: err.message });
  }
}