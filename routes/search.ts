import { Router } from "express";
import fs from "fs";
import path from "path";

const router = Router();

type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  tags: string[];
};

const productsPath = path.join(__dirname, "..", "products.json");
const products: Product[] = JSON.parse(fs.readFileSync(productsPath, "utf8"));

router.get("/", (req, res) => {
  const { query, limit, skip } = req.query;

  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ error: "Query parameter is required and must be a string" });
  }

  const keywords = query.toLowerCase().split(" ");

  let matchingProducts = products.filter((product) =>
    keywords.some(
      (keyword) =>
        product.name.toLowerCase().includes(keyword) ||
        product.description.toLowerCase().includes(keyword)
    )
  );

  const totalResults = matchingProducts.length;

  if (skip) {
    const skipNumber = parseInt(skip as string);
    if (!isNaN(skipNumber) && skipNumber > 0) {
      matchingProducts = matchingProducts.slice(skipNumber);
    }
  }

  if (limit) {
    const limitNumber = parseInt(limit as string);
    if (!isNaN(limitNumber) && limitNumber > 0) {
      matchingProducts = matchingProducts.slice(0, limitNumber);
    }
  }

  if (matchingProducts.length > 0) {
    res.status(200).json({
      totalResults,
      results: matchingProducts,
    });
  } else {
    res.status(404).json({ message: "No matching products found." });
  }
});

// Route to get product by ID
router.get("/product", (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res
      .status(400)
      .json({ error: "ID parameter is required and must be a string" });
  }

  const product = products.find((p) => p.id === id);

  if (product) {
    res.status(200).json(product);
  } else {
    res.status(404).json({ message: "Product not found." });
  }
});

export default router;
