const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class DepositLimitError extends BaseError {
  constructor(maxAmount) {
    super(
      `Failed to deposit. You can't deposit more than $${maxAmount}`,
      HttpStatus.BadRequest,
      'FAILED_TO_DEPOSIT',
    );
  }
}

module.exports = { DepositLimitError };
