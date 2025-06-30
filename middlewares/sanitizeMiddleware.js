const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const sanitizeMiddleware = (app) => {
  // Elimina $ y . de cualquier key enviada en req.body, req.query, req.params
  app.use(mongoSanitize());

  // Limpia cualquier input de posibles scripts XSS
  app.use(xss());
};

module.exports = sanitizeMiddleware;
