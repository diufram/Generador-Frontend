// src/routes/customerRoutes.js

const express = require("express");
const router = express.Router();

const {indexSingin,indexSingup, singin, singup ,logout} = require("../controllers/authenticateController");
const isNoAuthenticated= require('../middlewares/isNoAuthenticate')

router.get("/index-singin",  isNoAuthenticated,indexSingin);
router.get("/index-singup", isNoAuthenticated,indexSingup);

router.post("/singin", isNoAuthenticated,singin);
router.post("/singup", isNoAuthenticated,singup);
router.get("/logout", logout);


module.exports = router;
