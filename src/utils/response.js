function successResponse(res, data, message) {
  return {
    success: true,
    data,
    message,
  };
}

function errorResponse(res, message = "Internal Server Error", statusCode = 500, stack = null) {
  return {
    success: false,
    message,
    statusCode,
    stack: process.env.NODE_ENV === "production" ? null : stack,
  };
}

module.exports = { successResponse, errorResponse };