const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class ForbiddenError extends BaseError {
  constructor() {
    super('Forbidden', HttpStatus.Forbidden, 'FORBIDDEN');
  }
}

module.exports = { ForbiddenError };
