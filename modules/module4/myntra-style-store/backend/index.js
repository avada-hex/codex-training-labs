const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5174;

app.use(cors());
app.use(express.json());

const products = [
  {
    id: 1,
    name: "Anaya Chiffon Saree",
    price: 4599,
    currency: "INR",
    badge: "New",
    category: "Ethnic",
    description: "Lightweight chiffon saree paired with subtle embroidery.",
    delivery: "2-3 days",
  },
  {
    id: 2,
    name: "Urban Journey Sneakers",
    price: 3199,
    currency: "INR",
    badge: "Fast Delivery",
    category: "Western",
    description: "Breathable knit and traction suited for city commutes.",
    delivery: "Next-day",
  },
  {
    id: 3,
    name: "Studio 87 Raw Silk Kurta",
    price: 2450,
    currency: "INR",
    badge: "Best Seller",
    category: "Ethnic",
    description: "Raw silk kurta with tonal embroidery details.",
    delivery: "2-4 days",
  },
  {
    id: 4,
    name: "Citify Smart Watch",
    price: 6799,
    currency: "INR",
    badge: "Trending",
    category: "Gadgets",
    description: "AMOLED screen, NFC payments, and Hindi/English voice assistant.",
    delivery: "24-hour",
  },
  {
    id: 5,
    name: "Heritage Block Print Co-ord",
    price: 2999,
    currency: "INR",
    badge: "Limited",
    category: "Ethnic",
    description: "Block-printed top and pants set in organic cotton.",
    delivery: "3 days",
  },
  {
    id: 6,
    name: "Noir Edition Sunglasses",
    price: 1499,
    currency: "INR",
    badge: "Rave Reviews",
    category: "Accessories",
    description: "Curved frames with UV 400 protection and blue light filter.",
    delivery: "2 days",
  },
];

app.get("/api/products", (req, res) => {
  const curated = products.map((product) => ({
    ...product,
    priceFormatted: new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: product.currency,
    }).format(product.price),
  }));
  res.json({ banner: "Festival Drop · Free COD · Express delivery", curated });
});

app.listen(PORT, () => {
  console.log(`Catalog API listening on http://localhost:${PORT}`);
});
