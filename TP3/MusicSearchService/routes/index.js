var express = require("express");
var router = express.Router();

router.get("/", function(req, res) {
  res.render("index", { title: "Accueil", message: "accueil" });
});
router.get("/accueil", function(req, res) {
  res.render("index", { title: "Accueil", message: "accueil" });
});
router.get("/produits", function(req, res) {
  res.render("products", { title: "Produits", message: "produits" });
});
router.get("/produit", function(req, res) {
  res.render("product", { title: "Produit", message: "produits" });
});
router.get("/contact", function(req, res) {
  res.render("contact", { title: "Contact", message: "contact" });
});
router.get("/panier", function(req, res) {
  res.render("shopping-cart", { title: "Panier" });
});
router.get("/commande", function(req, res) {
  res.render("order", { title: "Commande" });
});
router.get("/confirmation", function(req, res) {
  res.render("confirmation", { title: "Confirmation", name: req.query.name, orderId: req.query.orderId });
});

module.exports = router;
