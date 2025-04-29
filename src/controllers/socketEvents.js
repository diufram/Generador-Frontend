const Sala = require("../models/salaModel");

let diagramState = {};
let sala_Id = "";

const joinRoom = async (socket, io, data) => {
  const userId = socket.handshake.session.userId;
  sala_Id = data.salaId;
  try {
    //const userHasAccess = await checkUserAccessToSala(userId, sala_Id);

    if (true) {
      const roomName = sala_Id; // Crea una sala única basada en el ID de la sala
      socket.join(roomName);
      console.log(`Usuario ${userId} se unió a la sala ${sala_Id}`);

      // Obtener el diagrama guardado para esta sala
      const diagrama = await Sala.getDiagrama(sala_Id);

      if (diagrama != null) {
        diagramState = diagrama;
      }

      // Enviar el estado actual del diagrama solo a los usuarios de esta sala
      socket.emit("init", diagramState);

      // Notificar a todos los usuarios de la sala
      io.to(roomName).emit("message", `Usuario ${userId} se unió a la sala.`);
    } else {
      socket.emit("error", "No tienes acceso a esta sala.");
    }
  } catch (error) {
    console.error("Error al intentar unirse a la sala:", error);
    socket.emit("error", "Ocurrió un error al intentar unirse a la sala.");
  }
};
const updatePizarra = async (socket, data) => {
  diagramState = data;
  await Sala.saveDiagrama(sala_Id, diagramState);
  socket.to(sala_Id).emit("actualizarProyecto", data);
};



module.exports = {
  joinRoom,
  updatePizarra,
};
