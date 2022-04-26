const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../model');
const { ContractStatus } = require('../const/contractStatus');
const { formatDate } = require('../utils');

function JobRepository() {
  return {
    async findById(jobId) {
      return sequelize.models.Job.findOne({
        where: { id: jobId },
        include: {
          model: sequelize.models.Contract,
          required: true,
        },
      });
    },

    async findUnpaidJobs(profileId) {
      return sequelize.models.Job.findAll({
        where: { [Op.or]: [{ paid: false }, { paid: null }] },
        include: {
          model: sequelize.models.Contract,
          required: true,
          attributes: [],
          where: {
            status: ContractStatus.InProgress,
            [Op.or]: [{ ContractorId: profileId }, { ClientId: profileId }],
          },
        },
      });
    },
    async setPaid(jobId, transaction) {
      return sequelize.models.Job.update(
        { paid: true, paymentDate: new Date() },
        { where: { id: jobId }, transaction },
      );
    },
    async findBestProfessions(startDate, endDate) {
      return sequelize.query(
        `select p.profession, sum(j.price) as amount
from Jobs j
         join Contracts c on c.id = j.ContractId
         join Profiles p on p.id = c.ContractorId
where j.paid = true and j.paymentDate > $start and j.paymentDate < $end
group by p.profession
order by amount desc;`,
        {
          bind: { start: formatDate(startDate), end: formatDate(endDate) },
          type: QueryTypes.SELECT,
        },
      );
    },
    async findBestClients(startDate, endDate, limit) {
      return sequelize.query(
        `select p.id, p.firstName || ' ' || p.lastName as fullName, sum(j.price) as paid
from Jobs j
         join Contracts c on c.id = j.ContractId
         join Profiles p on p.id = c.ClientId
where j.paid = true and j.paymentDate > $start and j.paymentDate < $end
group by p.id
order by paid desc limit $limit;`,
        {
          bind: {
            start: formatDate(startDate),
            end: formatDate(endDate),
            limit,
          },
          type: QueryTypes.SELECT,
        },
      );
    },
  };
}

const jobRepository = new JobRepository();

module.exports = { JobRepository, jobRepository };
