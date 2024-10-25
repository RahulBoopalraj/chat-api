import { Router } from "express";
import db from "../utils/db";

const router = Router();

router.get("/", (req, res) => {
  res.redirect("/admin/product?page=1&search=");
});

router.get("/product", async (req, res) => {
  let { page = 1, search } = req.query;
  const limit = 10;

  page = parseInt(page as string);

  const skip = ((page as number) - 1) * limit;

  try {
    let products;
    let totalCount;
    let whereCondition = {};

    [products, totalCount] = await Promise.all([
      db.product.findMany({
        where: search ? {
          name: {
            contains: search as string,
            mode: "insensitive",
          }
        } : undefined,
        take: limit,
        skip: skip,
      }),
      db.product.count({ where: whereCondition }),
    ]);

    const lastPage = Math.ceil(totalCount / limit);

    const previousExist = (page as number) > 1;
    const nextExist = (page as number) < (lastPage as number);

    const previousLink = previousExist
      ? `/admin/product?page=${(page as number) - 1}&search=${search || ""}`
      : "";
    const nextLink = nextExist
      ? `/admin/product?page=${(page as number) + 1}&search=${search || ""}`
      : "";

    res.render("adminproduct", {
      products,
      search: search || "",
      page: page as number,
      previousLink,
      nextLink,
      previousExist,
      nextExist,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Internal server error");
  }
});

router
  .route("/products/add")
  .get(async (req, res) => {
    res.render("addproduct");
  })
  .post(async (req, res) => {
    const { name, price, description, tags } = req.body;

    try {
      await db.product.create({
        data: {
          name,
          price: parseInt(price),
          description,
          tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
        },
      });
      res.redirect("/admin/product");
    } catch (error) {
      console.error("Error adding product:", error);
      res.status(500).send("Internal server error");
    }
  });

router
  .route("/products/edit/:id")
  .get(async (req, res) => {
    const { id } = req.params;

    try {
      const product = await db.product.findUnique({
        where: { id: id },
      });

      if (!product) {
        return res.status(404).send("Product not found");
      }

      res.render("editproduct", {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        tags: product.tags.join(", "),
      });
    } catch (error) {
      console.error("Error fetching product for editing:", error);
      res.status(500).send("Internal server error");
    }
  })
  .post(async (req, res) => {
    const { id } = req.params;
    const { name, price, description, tags } = req.body;

    try {
      const updatedProduct = await db.product.update({
        where: { id: id },
        data: {
          name,
          price: parseInt(price),
          description,
          tags: tags ? tags.split(",").map((tag: string) => tag.trim()) : [],
        },
      });
      res.redirect("/admin/product");
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal server error");
    }
  });

export default router;
