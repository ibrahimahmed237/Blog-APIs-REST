const appError = class appError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
};

const devErrorHandler = (res, error) => {
  console.log("Error ", error);
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stackTrace: error.stack,
    statusCode: error.statusCode,
  });
};

const prodErrorHandler = (res, error) => {
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      statusCode: error.statusCode,
    });
  } else {
    console.log("Error ", error);
    res.status(500).json({
      status: "error",
      message: "something went wrong!",
      error: error,
      statusCode: error.statusCode,
    });
  }
};

const castErrorHandler = (error) => {
  const msg = `Invalid value ${error.value} for field ${error.path}`;
  return new appError(msg, 400);
};


module.exports = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || "error";

  if (process.env.NODE_ENV === "development") {
    devErrorHandler(res, error);
  } else {
    if (error.name === "CastError") error = castErrorHandler(error);
    prodErrorHandler(res, error);
  }
};
module.exports.appError = appError;
