const session = require("express-session");
const { Sequelize } = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store); // Conectar Sequelize con las sesiones
const sequelize = require("./database"); // Tu instancia de Sequelize configurada

// Crear el almacenamiento de sesiones usando Sequelize
const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions", // Puedes cambiar el nombre de la tabla si lo deseas
  checkExpirationInterval: 15 * 60 * 1000, // Verificar cada 15 minutos
  expiration: 24 * 60 * 60 * 1000, // Expira después de 24 horas
});

// Sincronizar la tabla de sesiones con la base de datos
sessionStore.sync()
  .then(() => {
    console.log("Tabla de sesiones sincronizada con la base de datos");
  })
  .catch((error) => {
    console.error("Error al sincronizar la tabla de sesiones:", error);
  });

// Configuración de la sesión
const sessionConfig = session({
  store: sessionStore,
  secret: "your_secret_key", 
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, 
    maxAge: 1000 * 60 * 60 * 24, // 1 día
  },
});

module.exports = { sessionConfig, sessionStore }; // Exportar ambos
