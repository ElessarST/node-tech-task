const { contractRepository } = require('../repositories/contractRepository');
const { NotFoundError } = require('../errors/notFoundError');

function ContractService(ContractRepository) {
  function checkAccess(contract, profileId) {
    return (
      contract.ContractorId === profileId || contract.ClientId === profileId
    );
  }

  return {
    async findById(contractId, profileId) {
      const contract = await ContractRepository.findById(contractId);
      if (!contract) {
        throw new NotFoundError();
      }
      if (!checkAccess(contract, profileId)) {
        throw new NotFoundError();
      }
      return contract;
    },

    async getActiveContracts(profileId) {
      return ContractRepository.getActiveContracts(profileId);
    },
  };
}

const contractService = new ContractService(contractRepository);

module.exports = { ContractService, contractService };
