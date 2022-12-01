var express = require("express");
var router = express.Router();

const { db } = require("../mongo");
const { v4 } = require("uuid");

router.get("/", (req, res) => {
  res.send("respond with a resource");
});

router.get("/all", async (req, res) => {
  try {
    const item = await db().collection("items").find({}).toArray();

    res.json({
      success: true,
      item: item,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

router.post("/create-one", async (req, res) => {
  try {
    const newItem = {
      ...req.body,
      id: v4,
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      rating: req.body.rating,
      stock: req.body.stock,
      brand: req.body.brand,
      category: req.body.category,
      creationDate: new Date(),
      lastModified: new Date(),
    };

    const addItem = db().collection("items").insertOne(newItem);
    console.log(addItem);

    res.json({
      success: true,
      item: newItem,
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.toString(),
    });
  }
});

// router.post("/add-to-cart", async (req, res) => {
//   try {
//     const newItem = {
//       ...req.body,
//       inCart: true,
//     };

//     const addItem = db().collection("items").insertOne(newItem);
//     console.log(addItem);

//     res.json({
//       success: true,
//       cartItem: newItem,
//     });
//   } catch (err) {
//     res.json({
//       success: false,
//       error: err.toString(),
//     });
//   }
// });

// router.delete("/delete-one/:id", async (req, res) => {
//   try {
//     const id = req.params.title;

//     const deleteItem = await db().collection("items").deleteOne({
//       title: id,
//     });

//     res.json({
//       success: true,
//       item: deleteItem,
//     });
//   } catch (error) {
//     res.json({
//       success: false,
//       error: error.toString(),
//     });
//   }
// });

module.exports = router