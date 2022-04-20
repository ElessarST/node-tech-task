const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class BadArgumentsError extends BaseError {
  constructor(message) {
    super(message, HttpStatus.BadRequest, 'BAD_ARGUMENTS');
  }
}

module.exports = { BadArgumentsError };
