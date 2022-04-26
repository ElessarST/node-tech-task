const { jobRepository } = require('../repositories/jobRepository');
const { ForbiddenError } = require('../errors/forbiddenError');
const { NotEnoughBalanceError } = require('../errors/notEnoughBalanceError');
const { profileRepository } = require('../repositories/profileRepository');
const { PayJobError } = require('../errors/payJobError');
const { JobPaidError } = require('../errors/jobPaidError');
const { NotFoundError } = require('../errors/notFoundError');
const { transactionGetter } = require('../repositories/transactionGetter');

function JobService(JobRepository, ProfileRepository, TransactionGetter) {
  // NOTE: not scalable. Redis could be used to lock job payment
  const currentJobPayments = new Set();
  return {
    async getUnpaidJobs(profileId) {
      return JobRepository.findUnpaidJobs(profileId);
    },

    /**
     * Pay for a job
     * Transfer money from the client to the contractor
     * and mark job as paid
     * @param profile   profile of payer
     * @param jobId     job to pay
     */
    async pay(profile, jobId) {
      const job = await JobRepository.findById(jobId);
      if (!job) {
        throw new NotFoundError();
      }
      const { ClientId, ContractorId } = job.Contract;
      const isJobClient = ClientId === profile.id;
      if (!isJobClient) {
        throw new ForbiddenError();
      }
      if (job.paid || currentJobPayments.has(jobId)) {
        throw new JobPaidError();
      }
      const isEnoughBalance = profile.balance > job.price;
      if (!isEnoughBalance) {
        throw new NotEnoughBalanceError();
      }
      const transaction = await TransactionGetter.createTransaction().catch(
        (e) => {
          currentJobPayments.delete(jobId);
          throw e;
        },
      );
      try {
        currentJobPayments.add(jobId);
        await ProfileRepository.transferMoney(
          ClientId,
          ContractorId,
          job.price,
          transaction,
        );
        await JobRepository.setPaid(jobId, transaction);
        await transaction.commit();
        currentJobPayments.delete(jobId);
      } catch (error) {
        currentJobPayments.delete(jobId);
        await transaction.rollback();
        throw new PayJobError();
      }
    },
  };
}

const jobService = new JobService(
  jobRepository,
  profileRepository,
  transactionGetter,
);

module.exports = { JobService, jobService };
