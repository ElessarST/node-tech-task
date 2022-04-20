const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class DepositIncorrectAmountError extends BaseError {
  constructor(amount) {
    super(
      `Failed to deposit ${amount}. The amount is wrong`,
      HttpStatus.BadRequest,
      'DEPOSIT_INCORRECT_VALUE_ERROR',
    );
  }
}

module.exports = { DepositIncorrectAmountError };
