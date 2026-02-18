// api/wow-proxy.js
export default async function handler(req, res) {
  const { itemId } = req.query;

  // 1. Dohvat access tokena
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

  // 2. Dohvat commodity aukcija
  const ahRes = await fetch(
    `https://eu.api.blizzard.com/data/wow/auctions/commodities?namespace=dynamic-eu&locale=en_US`,
    {
      headers: { Authorization: `Bearer ${access_token}` },
    }
  );

  const data = await ahRes.json();

  // 3. Filtriraj samo traženi item i nađi minimalnu cijenu
  const itemAuctions = data.auctions.filter(
  (a) => a.item.id === parseInt(itemId)
);

if (itemAuctions.length === 0) {
  return res.status(404).json({ error: "Item not found on AH" });
}

// Sortiraj uzlazno po cijeni i uzmi top 5
const top5 = itemAuctions
  .sort((a, b) => a.unit_price - b.unit_price)
  .slice(0, 5)
  .map((a) => ({
    priceGold: parseFloat((a.unit_price / 10000).toFixed(2)),
    quantity: a.quantity,
  }));

const totalQuantity = itemAuctions.reduce((sum, a) => sum + a.quantity, 0);

res.status(200).json({
  itemId: parseInt(itemId),
  top5Prices: top5,
  totalQuantity,
  auctionCount: itemAuctions.length,
});

  // Minimalna cijena (aukcije su sortirane uzlazno po cijeni)
  const minPrice = Math.min(...itemAuctions.map((a) => a.unit_price));
  const totalQuantity = itemAuctions.reduce((sum, a) => sum + a.quantity, 0);

  // Konverzija: copper → gold (1 gold = 10000 copper)
  const goldPrice = (minPrice / 10000).toFixed(2);

  res.status(200).json({
    itemId: parseInt(itemId),
    minPriceGold: parseFloat(goldPrice),
    totalQuantity,
    auctionCount: itemAuctions.length,
  });
}