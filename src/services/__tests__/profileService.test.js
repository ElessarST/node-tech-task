const { ProfileService } = require('../profileService');
const { DepositLimitError } = require('../../errors/depositLimitError');
const {
  DepositIncorrectAmountError,
} = require('../../errors/depositIncorrectAmountError');

function createService(
  jobRepositoryOverrides = {},
  profileRepositoryOverrides = {},
) {
  const jobRepositoryMock = {
    findUnpaidJobs: jest.fn(),
    ...jobRepositoryOverrides,
  };
  const profileRepositoryMock = {
    depositMoney: jest.fn(),
    ...profileRepositoryOverrides,
  };
  return new ProfileService(profileRepositoryMock, jobRepositoryMock);
}

const profileMock = {
  id: 1,
  balance: 1000,
};

describe('ProfileService', () => {
  describe('deposit money', () => {
    it('should throw error for incorrect amount', async () => {
      const depositMoneyMock = jest.fn();
      const service = createService({}, { depositMoney: depositMoneyMock });
      await expect(() =>
        service.depositMoney(profileMock, 0),
      ).rejects.toThrowError(new DepositIncorrectAmountError(0));
      await expect(() =>
        service.depositMoney(profileMock, -1),
      ).rejects.toThrowError(new DepositIncorrectAmountError(-1));
      await expect(() =>
        service.depositMoney(profileMock, -100),
      ).rejects.toThrowError(new DepositIncorrectAmountError(-100));
      expect(depositMoneyMock).not.toHaveBeenCalled();
    });
    it('should throw error if exceeded 0.25 unpaid job sum limit', async () => {
      const findUnpaidJobsMock = jest
        .fn()
        .mockResolvedValue([{ price: 500 }, { price: 500 }]);
      const depositMoneyMock = jest.fn();
      const service = createService(
        {
          findUnpaidJobs: findUnpaidJobsMock,
        },
        { depositMoney: depositMoneyMock },
      );
      await expect(() =>
        service.depositMoney(profileMock, 1000),
      ).rejects.toThrowError(new DepositLimitError(250));
      await expect(() =>
        service.depositMoney(profileMock, 251),
      ).rejects.toThrowError(new DepositLimitError(250));
      expect(depositMoneyMock).not.toHaveBeenCalled();
    });
    it('should deposit money if not exceeded limit', async () => {
      const findUnpaidJobsMock = jest
        .fn()
        .mockResolvedValue([{ price: 500 }, { price: 500 }]);
      const depositMoneyMock = jest.fn();
      const service = createService(
        {
          findUnpaidJobs: findUnpaidJobsMock,
        },
        { depositMoney: depositMoneyMock },
      );
      await service.depositMoney(profileMock, 250);
      expect(depositMoneyMock).toHaveBeenCalledWith(profileMock.id, 250);
      await service.depositMoney(profileMock, 1);
      expect(depositMoneyMock).toHaveBeenCalledWith(profileMock.id, 1);
      await service.depositMoney(profileMock, 100);
      expect(depositMoneyMock).toHaveBeenCalledWith(profileMock.id, 100);
    });
  });
});
