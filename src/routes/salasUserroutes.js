
const express = require("express");
const router = express.Router();
const {
    indexSalasCompartidas,
    diagramaCompartido,
    compartir,
    deleteSalaCompartida,

  } = require("../controllers/userSalaController");
router.get("/index-sala-compartidas", indexSalasCompartidas);
router.get("/delete-sala-compartida/:id", deleteSalaCompartida);
router.get("/diagrama-compartido/:id", diagramaCompartido);
router.get("/compartir/:id", compartir);
module.exports = router;