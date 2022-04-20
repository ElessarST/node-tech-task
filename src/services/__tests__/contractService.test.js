const { ContractService } = require('../contractService');
const { NotFoundError } = require('../../errors/notFoundError');
const { ContractStatus } = require('../../const/contractStatus');

function createService(repositoryOverrides = {}) {
  const contractRepositoryMock = {
    findById: jest.fn(),
    getActiveContracts: jest.fn(),
    ...repositoryOverrides,
  };
  return new ContractService(contractRepositoryMock);
}

const contractMock = {
  status: ContractStatus.InProgress,
  ClientId: 1,
  ContractorId: 2,
};

describe('ContractService', () => {
  describe('get contract by id', () => {
    it('should throw error if contract not found', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(null);
      const service = createService({ findById: findByIdMock });
      await expect(() => service.findById(1, 1)).rejects.toThrowError(
        new NotFoundError(),
      );
    });
    it('should throw not found error if profile dont has access', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(contractMock);
      const service = createService({ findById: findByIdMock });
      await expect(() => service.findById(1, 3)).rejects.toThrowError(
        new NotFoundError(),
      );
    });
    it('should return found contract if profile has access as client', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(contractMock);
      const service = createService({ findById: findByIdMock });
      const contract = await service.findById(1, 1);
      expect(contract).toEqual(contract);
    });
    it('should return found contract if profile has access as contractor', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(contractMock);
      const service = createService({ findById: findByIdMock });
      const contract = await service.findById(1, 2);
      expect(contract).toEqual(contract);
    });
  });
});
