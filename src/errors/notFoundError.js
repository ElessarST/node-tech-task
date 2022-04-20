const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class NotFoundError extends BaseError {
  constructor() {
    super('Not Found', HttpStatus.NotFound, 'NOT_FOUND');
  }
}

module.exports = { NotFoundError };
