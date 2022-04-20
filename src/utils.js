const { parse, isValid, format } = require('date-fns');

const DATE_FORMAT = 'yyyy-MM-dd';

function parseDate(dateString) {
  const date = parse(dateString, DATE_FORMAT, new Date());
  if (!isValid(date)) {
    return null;
  }
  return date;
}

function formatDate(date) {
  return format(date, DATE_FORMAT);
}

module.exports = { parseDate, formatDate };
