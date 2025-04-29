const express = require('express');
const authRoutes = require('./authenticateRoutes');
const salaRoutes = require('./salasRoutes');
const salaUserRoutes = require('./salasUserroutes');
const router = express.Router();

router.use(authRoutes);  // Todas las rutas de autenticación se manejarán con el enrutador de auth
router.use(salaRoutes); // Todas las rutas de salas
router.use(salaUserRoutes); // Todas las rutas de salas

module.exports = router;
