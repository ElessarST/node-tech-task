const { jobRepository } = require('../repositories/jobRepository');

function ProfessionService(JobRepository) {
  return {
    async findBestProfessions(startDate, endDate) {
      return JobRepository.findBestProfessions(startDate, endDate);
    },
  };
}

const professionService = new ProfessionService(jobRepository);

module.exports = { professionService, ProfessionService };
