// Helper estandarizado para respuestas JSON (cumple con DRY)
const sendResponse = (res, statusCode, status, message, payload = {}) => {
  return res.status(statusCode).json({
    status,
    message,
    ...payload,
  });
};

// Formateador de objeto usuario para no exponer password_hash
const formatUser = (userRow) => {
  if (!userRow) return null;
  return {
    id: userRow.id,
    username: userRow.username,
    email: userRow.email,
    fecha_registro: userRow.fecha_registro,
  };
};

module.exports = { sendResponse, formatUser };