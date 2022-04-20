const { Op } = require('sequelize');
const { sequelize } = require('../model');
const { ContractStatus } = require('../const/contractStatus');

function ContractRepository() {
  return {
    async findById(contractId) {
      return sequelize.models.Contract.findOne({ where: { id: contractId } });
    },
    async getActiveContracts(profileId) {
      return sequelize.models.Contract.findAll({
        where: {
          [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
          status: { [Op.ne]: ContractStatus.Terminated },
        },
      });
    },
  };
}

const contractRepository = new ContractRepository();

module.exports = { ContractRepository, contractRepository };
