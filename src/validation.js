const { BadArgumentsError } = require('./errors/badArgumentsError');

function validateDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    throw new BadArgumentsError(
      '"start" and "end" date params in format yyyy-mm-dd are required',
    );
  }
}

module.exports = { validateDateRange };
