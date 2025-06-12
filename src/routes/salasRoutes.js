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
  exportFlutter,
  importImg,
  importPromt
} = require("../controllers/salaController");
const isAuthenticated = require("../middlewares/isAuthenticate");
router.get("/index-sala", isAuthenticated, indexSala);
router.get("/store-sala", isAuthenticated, storeSala);
router.post("/create-sala", isAuthenticated, createSala);
router.get("/edit-sala/:id", isAuthenticated, editSala);
router.post("/update-sala", isAuthenticated, updateSala);
router.get("/delete-sala/:id", isAuthenticated, deleteSala);

router.post("/import-promt/:id", importPromt);

router.post("/export-flutter", upload.single("imageF"), exportFlutter);

router.post("/import-img/:id", upload.single("image"), importImg);

module.exports = router;
