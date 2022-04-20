const { HttpStatus } = require('../const/httpStatusCode');

// eslint-disable-next-line no-unused-vars
function clientErrorHandler(err, req, res, next) {
  console.error(err);
  if (err.statusCode) {
    res
      .status(err.statusCode)
      .json({ error: true, message: err.message, code: err.errorCode });
  } else {
    res.status(HttpStatus.InternalError).json({
      error: true,
      message: 'Something went wrong',
      code: 'INTERNAL_ERROR',
    });
  }
}

module.exports = { clientErrorHandler };
