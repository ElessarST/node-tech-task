const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class JobPaidError extends BaseError {
  constructor() {
    super('Job is already paid', HttpStatus.BadRequest, 'JOB_PAID_ERROR');
  }
}

module.exports = { JobPaidError };
