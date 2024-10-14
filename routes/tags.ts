import { Router } from "express";
import db from "../utils/db";

const router = Router();

// Route to get products by tag
router.get("/product", async (req, res) => {
  const { tag, skip, limit } = req.query;

  if (!tag || typeof tag !== "string" || tag.trim() === "") {
    return res.status(400).json({
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

  try {
    let matchingProducts = await db.product.findMany({
      where: {
        tags: {
          hasSome: tags,
        },
      },
      skip: skip ? parseInt(skip as string) : undefined,
      take: limit ? parseInt(limit as string) : undefined,
    });

    const totalResults = matchingProducts.length;

    if (matchingProducts.length > 0) {
      res.status(200).json({
        totalResults,
        results: matchingProducts,
      });
    } else {
      res.status(404).json({
        message:
          "No products found with the given tag(s). Please try different tags or check your spelling.",
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get all unique tags
router.get("/tags", async (req, res) => {
  try {
    const products = await db.product.findMany({
      select: {
        tags: true,
      },
    });

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
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
