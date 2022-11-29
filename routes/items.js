var express = require("express");
var router = express.Router();

const { db } = require("../mongo");
// const { v4 } = require("uuid");

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

module.exports = router