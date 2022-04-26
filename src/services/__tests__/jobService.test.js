const { NotFoundError } = require('../../errors/notFoundError');
const { ContractStatus } = require('../../const/contractStatus');
const { JobService } = require('../jobService');
const { ForbiddenError } = require('../../errors/forbiddenError');
const { NotEnoughBalanceError } = require('../../errors/notEnoughBalanceError');
const { JobPaidError } = require('../../errors/jobPaidError');
const { PayJobError } = require('../../errors/payJobError');

function createService(
  jobRepositoryOverrides = {},
  profileRepositoryOverrides = {},
) {
  const transactionMock = {
    createTransaction: jest
      .fn()
      .mockResolvedValue({ commit: jest.fn(), rollback: jest.fn() }),
  };
  const jobRepositoryMock = {
    findById: jest.fn(),
    setPaid: jest.fn(),
    ...jobRepositoryOverrides,
  };
  const profileRepositoryMock = {
    transferMoney: jest.fn(),
    ...profileRepositoryOverrides,
  };
  return new JobService(
    jobRepositoryMock,
    profileRepositoryMock,
    transactionMock,
  );
}

const profileMock = {
  id: 1,
  balance: 1000,
};

const jobMock = {
  paid: false,
  price: 100,
  Contract: {
    status: ContractStatus.InProgress,
    ClientId: 1,
    ContractorId: 2,
  },
};

describe('JobService', () => {
  describe('pay for a job', () => {
    it('should throw error if job not found', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(null);
      const service = createService({ findById: findByIdMock });
      await expect(() => service.pay(profileMock, 1)).rejects.toThrowError(
        new NotFoundError(),
      );
    });
    it('should throw forbidden if profile has no access', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(jobMock);
      const service = createService({ findById: findByIdMock });
      await expect(() =>
        service.pay({ ...profileMock, id: 5 }, 1),
      ).rejects.toThrowError(new ForbiddenError());
    });
    it('should throw forbidden if profile is contractor', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(jobMock);
      const service = createService({ findById: findByIdMock });
      await expect(() =>
        service.pay({ ...profileMock, id: 2 }, 1),
      ).rejects.toThrowError(new ForbiddenError());
    });
    it('should throw error if job was paid before', async () => {
      const findByIdMock = jest
        .fn()
        .mockResolvedValue({ ...jobMock, paid: true });
      const service = createService({ findById: findByIdMock });
      await expect(() => service.pay(profileMock, 1)).rejects.toThrowError(
        new JobPaidError(),
      );
    });
    it('should throw error if profile does not have enough balance', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(jobMock);
      const service = createService({ findById: findByIdMock });
      await expect(() =>
        service.pay({ ...profileMock, balance: 0 }, 1),
      ).rejects.toThrowError(new NotEnoughBalanceError());
    });
    it('should throw error if transfer failed', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(jobMock);
      const transferMock = jest.fn().mockRejectedValueOnce(new Error());
      const service = createService(
        { findById: findByIdMock },
        { transferMoney: transferMock },
      );
      await expect(() => service.pay(profileMock, 1)).rejects.toThrowError(
        new PayJobError(),
      );
    });
    it('should set job paid if transfer succeeded', async () => {
      const findByIdMock = jest.fn().mockResolvedValue(jobMock);
      const setPaidMock = jest.fn();
      const transferMock = jest.fn().mockResolvedValue(true);
      const service = createService(
        { findById: findByIdMock, setPaid: setPaidMock },
        { transferMoney: transferMock },
      );
      await service.pay(profileMock, 1);
      expect(transferMock).toHaveBeenCalledWith(1, 2, 100, expect.any(Object));
      expect(setPaidMock).toHaveBeenCalled();
    });
  });
});
