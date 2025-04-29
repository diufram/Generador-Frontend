const socketIoSession = require("express-socket.io-session");
const {
    joinRoom,
    updatePizarra
} = require("./socketEvents");

const socketController = (io, sessionConfig) => {
  io.use(
    socketIoSession(sessionConfig, {
      autoSave: true,
    })
  );

  io.on("connection", (socket) => {
    console.log("Cliente conectado", socket.id);
    // Escuchar eventos y delegar a funciones específicas
    socket.on("joinRoom", (data) => joinRoom(socket, io, data));
    socket.on('guardarProyecto', (data) => updatePizarra(socket,data));



    socket.on("disconnect", () => {
      console.log("Cliente desconectado");
    });
  });
};

module.exports = { socketController };
