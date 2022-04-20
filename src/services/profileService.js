const { profileRepository } = require('../repositories/profileRepository');
const { jobRepository } = require('../repositories/jobRepository');
const { DepositLimitError } = require('../errors/depositLimitError');
const {
  DepositIncorrectAmountError,
} = require('../errors/depositIncorrectAmountError');

const DEPOSIT_LIMIT = 0.25;

function ProfileService(ProfileRepository, JobRepository) {
  return {
    async depositMoney(profile, amount) {
      if (amount <= 0) {
        throw new DepositIncorrectAmountError(amount);
      }
      const unpaidJobs = await JobRepository.findUnpaidJobs(profile.id);
      const unpaidAmount = unpaidJobs
        .map((job) => job.price)
        .reduce((a, b) => a + b, 0);
      const maxDepositAmount = unpaidAmount * DEPOSIT_LIMIT;
      const canDeposit = amount <= maxDepositAmount;
      if (!canDeposit) {
        throw new DepositLimitError(maxDepositAmount);
      }
      await ProfileRepository.depositMoney(profile.id, amount);
    },
  };
}

const profileService = new ProfileService(profileRepository, jobRepository);

module.exports = { profileService, ProfileService };
