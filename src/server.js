require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { sessionStore,sessionConfig }= require("./config/session_store");
const cors = require("cors");
const path = require("path");
const { socketController } = require("./controllers/socketController");
const expressLayouts = require("express-ejs-layouts");
const mainRouter = require("./routes"); // Importa el enrutador principal
const app = express();
app.use(express.json()); // Middleware para parsear JSON
const sequelize = require("./config/database");

// Configurar EJS como motor de plantillas
app.set("view engine", "ejs");
app.use(expressLayouts);
app.set("views", path.join(__dirname, "..", "views"));
app.use(express.static(path.join(__dirname, "..", "public")));

app.use(express.urlencoded({ extended: true }));
app.set("layout", "layouts/main");

app.use(sessionConfig);

app.use(
  cors({
    origin: "http://localhost:3000", // Cambia esto a la URL de tu frontend
    credentials: true, // Permitir el envío de cookies
  })
);

const server = http.createServer(app);
const io = socketIo(server); 

app.get('/', (req, res) => {
  res.redirect('/index-singin'); // Redirigir a la página de login
});


app.use(mainRouter);

// Inicializa la lógica de Socket.IO
socketController(io, sessionConfig);
// Ruta para el editor
app.get('/editor', (req, res) => {
  res.render('editor', { title: 'Editor de Página' });
});
// Sincronizar tanto la tabla de sesiones como los modelos de Sequelize con la base de datos
const startServer = async () => {
  try {
    // Sincronizar la tabla de sesiones
    await sessionStore.sync();
    console.log("Tabla de sesiones sincronizada con la base de datos");

    // Sincronizar los modelos de Sequelize
    await sequelize.sync({ force: false }); // Usa `force: true` si deseas recrear las tablas
    console.log("Modelos sincronizados con la base de datos");

    // Iniciar el servidor después de que las sincronizaciones se completen
    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`Servidor Iniciado en el puerto ${PORT}`);
    });

  } catch (err) {
    console.error("Error al sincronizar las tablas o iniciar el servidor:", err);
  }
};

// Iniciar el proceso de sincronización y el servidor
startServer();

// Error handler (opcional pero recomendado)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});
