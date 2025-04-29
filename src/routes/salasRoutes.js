// src/routes/customerRoutes.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  indexSala,
  storeSala,
  createSala,
  editSala,
  updateSala,
  deleteSala,
  exportarSoloPages,
  importXmi,
} = require("../controllers/salaController");
const isAuthenticated = require("../middlewares/isAuthenticate");
router.get("/index-sala", isAuthenticated, indexSala);
router.get("/store-sala", isAuthenticated, storeSala);
router.post("/create-sala", isAuthenticated, createSala);
router.get("/edit-sala/:id", isAuthenticated, editSala);
router.post("/update-sala", isAuthenticated, updateSala);
router.get("/delete-sala/:id", isAuthenticated, deleteSala);
router.get("/export-angular/:id", exportarSoloPages);
router.post("/import-class/:id", upload.single("xmiFile"), importXmi);

module.exports = router;
