import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", async (req, res) => {
  const { query, limit, skip } = req.query;

  if (!query || typeof query !== "string") {
    return res.status(400).json({
      error:
        "Query parameter is required and must be a non-empty string. Please provide a search term.",
    });
  }

  const keywords = query.toLowerCase().split(" ");

  try {
    let matchingProducts = await db.product.findMany({
      where: {
        OR: [
          {
            name: {
              contains: keywords.join(" "),
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: keywords.join(" "),
              mode: "insensitive",
            },
          },
        ],
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
          "No matching products found. Try using different keywords or check your spelling.",
      });
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get product by ID
router.get("/product", async (req, res) => {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({
      error:
        "ID parameter is required and must be a non-empty string. Please provide a valid product ID.",
    });
  }

  try {
    const product = await db.product.findUnique({
      where: { id: id },
    });

    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({
        message:
          "Product not found. The provided ID does not match any existing product.",
      });
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
