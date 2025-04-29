const User = require("../models/userModel");

const indexSingin = async (req, res) => {
  res.render("singin", {
    title: "Iniciar Session",
    layout: "layouts/singin",
    message: "",
    showErrorModal: false,
  });
};

const indexSingup = async (req, res) => {
  res.render("singup", { title: "Registrate", layout: "layouts/singup" });
};
const singin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Autenticar al usuario
    const { user } = await User.authenticateUser(email, password);

    if (!user) {
      throw new Error("Usuario no encontrado o contraseña incorrecta");
    }
    req.session.userId = user.id;
    req.session.username = user.nombre;
    req.session.save((err) => {
      if (err) {
        console.error("Error al guardar la sesión:", err);
        return res.render("singin", {
          showErrorModal: true,
          message: "Error al guardar la sesión",
          email: req.body.email,
          layout: "layouts/singin",
        });
      }
      res.redirect("/index-sala");
    });
  } catch (error) {
    console.log("Error detectado:", error.message);
    res.render("singin", {
      showErrorModal: true,
      message: error.message, // Mostrar el mensaje de error
      email: req.body.email, // Mantener el correo que el usuario ingresó
      layout: "layouts/singin",
    });
  }
};

const singup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const newUser = await User.createUser(name, email, password);

    if (newUser) {
      req.session.userId = newUser.id;
      req.session.username = newUser.name; // Asegúrate de guardar el nombre también

      // Guardar la sesión antes de redirigir
      req.session.save((err) => {
        if (err) {
          console.error("Error al guardar la sesión:", err);
          return res.render("singup", {
            showErrorModal: true,
            message: "Error al guardar la sesión",
            email: req.body.email,
            layout: "layouts/singup",
          });
        }

        // Redirigir solo cuando la sesión se ha guardado exitosamente
        res.redirect("/index-sala");
      });
    }
  } catch (error) {
    console.error("Error en el registro:", error);
    res.render("singup", {
      showErrorModal: true,
      message: error.message, // Muestra el mensaje de error
      email: req.body.email, // Mantén el correo en el formulario
      layout: "layouts/singup",
    });
  }
};

const logout = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Error al cerrar la sesión:", err);
      return res.status(500).send("Error al cerrar la sesión");
    }
    res.clearCookie("connect.sid");
    res.redirect("/index-singin");
  });
};

module.exports = {
  singin,
  singup,
  indexSingin,
  indexSingup,
  logout,
};
