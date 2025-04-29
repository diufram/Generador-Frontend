const { Sequelize } = require('sequelize');
require('dotenv').config();  // Asegúrate de cargar las variables de entorno


// Crear una instancia de Sequelize usando variables de entorno
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,      // Nombre de la base de datos
  process.env.DATABASE_USER,      // Usuario de la base de datos
  process.env.DATABASE_PASSWORD,  // Contraseña de la base de datos
  {
    host: process.env.DATABASE_HOST,    // Host de la base de datos
   
    dialect: process.env.DATABASE_DIALECT,   // Aquí asegúrate de que el dialecto esté bien configurado
    logging: false,  // Opcionalmente, desactivar el logging de consultas SQL
  }
);

module.exports = sequelize;
