const { sequelize } = require('../model');

function TransactionGetter() {
  return {
    async createTransaction() {
      return sequelize.transaction();
    },
  };
}

const transactionGetter = new TransactionGetter();

module.exports = { transactionGetter, Transaction: TransactionGetter };
