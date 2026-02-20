// api/midnight-materials.js
import { MIDNIGHT_TAILORING_MATERIALS } from "../src/data/midnightTailoringMaterials";

export default async function handler(req, res) {
  try {
    // 1) Access token
    const tokenRes = await fetch("https://eu.battle.net/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.BLIZZARD_CLIENT_ID}:${process.env.BLIZZARD_CLIENT_SECRET}`
          ).toString("base64"),
      },
      body: "grant_type=client_credentials",
    });

    const { access_token } = await tokenRes.json();
    if (!access_token) {
      return res.status(500).json({ error: "Token fetch failed" });
    }

    // 2) Sve commodities aukcije
    const ahRes = await fetch(
      "https://eu.api.blizzard.com/data/wow/auctions/commodities?namespace=dynamic-eu&locale=en_US",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );
    const data = await ahRes.json();
    const auctions = data.auctions || [];

    // 3) Izračun za svaki materijal
    const result = MIDNIGHT_TAILORING_MATERIALS.map((mat) => {
      if (mat.isVendor) {
        return {
          ...mat,
          source: "vendor",
          minPriceGold: null,
          totalQuantity: null,
          auctionCount: null,
        };
      }

      const itemAuctions = auctions.filter((a) => a.item.id === mat.id);
      if (!itemAuctions.length) {
        return {
          ...mat,
          source: "ah",
          minPriceGold: null,
          totalQuantity: 0,
          auctionCount: 0,
        };
      }

      const minPriceCopper = Math.min(...itemAuctions.map((a) => a.unit_price));
      const totalQuantity = itemAuctions.reduce(
        (sum, a) => sum + a.quantity,
        0
      );

      return {
        ...mat,
        source: "ah",
        minPriceGold: +(minPriceCopper / 10000).toFixed(2),
        totalQuantity,
        auctionCount: itemAuctions.length,
      };
    });

    res.status(200).json({ materials: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}