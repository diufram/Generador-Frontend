function isNoAuthenticated(req, res, next) {
  if (!req.session.userId) {
    return next();
  } else {
    res.redirect("/index-sala");
  }
}

module.exports = isNoAuthenticated;
