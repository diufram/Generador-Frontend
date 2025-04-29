function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    res.locals.username = req.session.username;
    return next(); // El usuario está autenticado, continúa con la siguiente función
  } else {
    res.locals.username = null;

    res.redirect("/index-singin");
  }
}

module.exports = isAuthenticated;
