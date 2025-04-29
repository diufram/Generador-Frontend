const UserSala = require("../models/userSalaModel");

const indexSalasCompartidas = async (req, res) => {
  try {
    const userId = req.session.userId;
    const salascompartidas = await UserSala.getAllSalasCompartidas(userId);

    res.render("salas_shared", {
      title: "Salas Compartidas",
      salas: salascompartidas,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};
const compartir = async (req, res) => {
  const { id } = req.params;
  try {
    const userId = req.session.userId;
    sala = id;
    if (sala) {
      await UserSala.addUserSala(userId, id);
      res.redirect("/index-sala-compartidas");
    } else {
      res.status(404).send("Sala no encontrada");
    }
  } catch (error) {
    console.error("Error al compartir la sala:", error);
    res.status(500).send("Error al intentar compartir la sala");
  }
};

const deleteSalaCompartida = async (req, res) => {
  const { id } = req.params;

  const userId = req.session.userId;

  try {
    await UserSala.delSalaCompatida(userId, id);
    res.redirect("/index-sala-compartidas");
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

const diagramaCompartido = async (req, res) => {
  try {
    const { id } = req.params;
    res.render("editor", {
      title: "Generador Frontend",
      aiDesign: null,
      salaId: id,
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving users" });
  }
};

module.exports = {
  indexSalasCompartidas,
  deleteSalaCompartida,
  compartir,
  diagramaCompartido
};
