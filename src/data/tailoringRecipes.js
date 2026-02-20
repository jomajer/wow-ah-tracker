// src/data/tailoringRecipes.js
import { MIDNIGHT_TAILORING_MATERIALS } from "./midnightTailoringMaterials";

// helper: nađi materijal po ID-u iz već postojeće liste
function mat(id) {
  return MIDNIGHT_TAILORING_MATERIALS.find((m) => m.id === id);
}

// TODO: provjeri da ovi ID-evi odgovaraju tvojim boltovima u MIDNIGHTTAILORINGMATERIALS
const ARCANOWEAVE_BOLT_ID = 239198; // primjer, uskladi s tvojim fajlom
const SUNFIRE_SILK_BOLT_ID = 239201; // primjer, uskladi s tvojim fajlom

export const TAILORING_RECIPES = [
  {
    id: "silvermoon-silk-pillow",
    name: "Silvermoon Silk Pillow",
    outputQuantity: 1,
    materials: [
      {
        materialId: ARCANOWEAVE_BOLT_ID,
        quantity: 8,
      },
      {
        materialId: SUNFIRE_SILK_BOLT_ID,
        quantity: 8,
      },
    ],
  },
  // ovdje kasnije dodaješ druge recepte
];

export function getRecipeById(recipeId) {
  return TAILORING_RECIPES.find((r) => r.id === recipeId) || null;
}

export function enrichRecipeWithMaterialNames(recipe) {
  return {
    ...recipe,
    materials: recipe.materials.map((m) => {
      const materialDef = mat(m.materialId);
      return {
        ...m,
        name: materialDef?.name ?? `Item ${m.materialId}`,
      };
    }),
  };
}