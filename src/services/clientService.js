const { jobRepository } = require('../repositories/jobRepository');

function ClientService(JobRepository) {
  return {
    async findBestClients(startDate, endDate, limit) {
      return JobRepository.findBestClients(startDate, endDate, limit);
    },
  };
}

const clientService = new ClientService(jobRepository);

module.exports = { clientService, ClientService };
