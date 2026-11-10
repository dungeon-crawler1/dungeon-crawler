// Formateador estándar de respuestas JSON de la API
function successResponse(data, message = 'Operación exitosa') {
  return { status: 'success', message, data };
}

function errorResponse(message = 'Error interno', status = 'error') {
  return { status, message };
}

module.exports = { successResponse, errorResponse };