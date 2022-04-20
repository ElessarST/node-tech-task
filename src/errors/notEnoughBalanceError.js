const { HttpStatus } = require('../const/httpStatusCode');
const { BaseError } = require('./baseError');

class NotEnoughBalanceError extends BaseError {
  constructor() {
    super(
      'Not enough balance to pay',
      HttpStatus.BadRequest,
      'NOT_ENOUGH_BALANCE',
    );
  }
}

module.exports = { NotEnoughBalanceError };
