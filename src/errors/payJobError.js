const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class PayJobError extends BaseError {
  constructor() {
    super('Failed to pay for a job', HttpStatus.BadRequest, 'FAILED_TO_PAY');
  }
}

module.exports = { PayJobError };
