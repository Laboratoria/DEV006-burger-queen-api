const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/extensions, import/no-unresolved
const User = require('../modules/users.js');

module.exports = (secret) => (req, resp, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return next();
  }

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') {
    return next();
  }

  // req.headers.Authorization = token;

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) {
      // Acceso prohibido
      return next(403);
    }
    // TODO: Verificar identidad del usuario usando `decodeToken.uid`
    req.user = await User.findById(decodedToken.id);
    if (!req.user) {
      next(404);
    }
    return next();
  });
};

module.exports.isAuthenticated = (req) => {
  // TODO: decidir por la informacion del request si la usuaria esta autenticada
  if (req.user) {
    return true;
  }
  return false;
};
module.exports.isAdmin = (req) => {
  // TODO: decidir por la informacion del request si la usuaria es admin
  if (req.user.role === 'admin') {
    return true;
  }
  return false;
};

module.exports.requireAuth = (req, resp, next) => (
  (!module.exports.isAuthenticated(req))
    ? next(401)
    : next()
);

module.exports.requireAdmin = (req, resp, next) => (
  // eslint-disable-next-line no-nested-ternary
  (!module.exports.isAuthenticated(req))
    ? next(401)
    // Unauthorized
    : (!module.exports.isAdmin(req))
      ? next(403)
      : next()
);
