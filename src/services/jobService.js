const { jobRepository } = require('../repositories/jobRepository');
const { ForbiddenError } = require('../errors/forbiddenError');
const { NotEnoughBalanceError } = require('../errors/notEnoughBalanceError');
const { profileRepository } = require('../repositories/profileRepository');
const { PayJobError } = require('../errors/payJobError');
const { JobPaidError } = require('../errors/jobPaidError');
const { NotFoundError } = require('../errors/notFoundError');

function JobService(JobRepository, ProfileRepository) {
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
      if (job.paid) {
        throw new JobPaidError();
      }
      const isEnoughBalance = profile.balance > job.price;
      if (!isEnoughBalance) {
        throw new NotEnoughBalanceError();
      }
      const transferred = await ProfileRepository.transferMoney(
        ClientId,
        ContractorId,
        job.price,
      );
      if (!transferred) {
        throw new PayJobError();
      }
      await JobRepository.setPaid(jobId);
    },
  };
}

const jobService = new JobService(jobRepository, profileRepository);

module.exports = { JobService, jobService };
