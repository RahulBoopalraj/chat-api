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

// Route to get products by tag
router.get("/product", (req, res) => {
  const { tag, skip, limit } = req.query;

  if (!tag || typeof tag !== "string" || tag.trim() === "") {
    return res
      .status(400)
      .json({
        error: "Tag parameter is required and must be a non-empty string",
      });
  }

  const tags = tag
    .toLowerCase()
    .split(",")
    .map((t) => t.trim())
    .filter((t) => t !== "");

  if (tags.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one valid tag must be provided" });
  }

  let matchingProducts = products.filter((product) =>
    tags.some((t) => product.tags.includes(t))
  );

  const totalResults = matchingProducts.length;

  if (skip) {
    const skipNumber = parseInt(skip as string);
    if (isNaN(skipNumber) || skipNumber < 0) {
      return res
        .status(400)
        .json({ error: "Skip parameter must be a non-negative integer" });
    }
    matchingProducts = matchingProducts.slice(skipNumber);
  }

  if (limit) {
    const limitNumber = parseInt(limit as string);
    if (isNaN(limitNumber) || limitNumber <= 0) {
      return res
        .status(400)
        .json({ error: "Limit parameter must be a positive integer" });
    }
    matchingProducts = matchingProducts.slice(0, limitNumber);
  }

  if (matchingProducts.length > 0) {
    res.status(200).json({
      totalResults,
      results: matchingProducts,
    });
  } else {
    res
      .status(404)
      .json({
        message:
          "No products found with the given tag(s). Please try different tags or check your spelling.",
      });
  }
});

// Route to get all unique tags
router.get("/tags", (req, res) => {
  const allTags = new Set<string>();

  products.forEach((product) => {
    product.tags.forEach((tag) => allTags.add(tag));
  });

  if (allTags.size === 0) {
    return res
      .status(404)
      .json({ error: "No tags found in the product database" });
  }

  res.status(200).json({
    totalTags: allTags.size,
    tags: Array.from(allTags).sort(),
  });
});

export default router;
