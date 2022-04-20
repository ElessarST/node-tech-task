const express = require('express');
const bodyParser = require('body-parser');
const { sequelize } = require('./model');
const { getProfile } = require('./middleware/getProfile');
const { contractService } = require('./services/contractService');
const { jobService } = require('./services/jobService');
const { clientErrorHandler } = require('./errors/errorHandler');
const { ForbiddenError } = require('./errors/forbiddenError');
const { profileService } = require('./services/profileService');
const { parseDate } = require('./utils');
const { professionService } = require('./services/professionService');
const { clientService } = require('./services/clientService');
const { validateDateRange } = require('./validation');

const app = express();
app.use(bodyParser.json());
app.set('sequelize', sequelize);
app.set('models', sequelize.models);

/**
 * @return the contract only if it belongs to the profile
 */
app.get('/contracts/:id', getProfile, async (req, res, next) => {
  try {
    const { id } = req.params;
    const contract = await contractService.findById(id, req.profile.id);
    res.json(contract);
  } catch (err) {
    next(err);
  }
});

/**
 * @return a list of contracts belonging to a user (client or contractor), the list should only
 *    contain non terminated contracts.
 */
app.get('/contracts', getProfile, async (req, res, next) => {
  try {
    const contracts = await contractService.getActiveContracts(req.profile.id);
    res.json(contracts);
  } catch (err) {
    next(err);
  }
});

/**
 * @return Get all unpaid jobs for a user (client or contractor), for active contracts only
 */
app.get('/jobs/unpaid', getProfile, async (req, res) => {
  const jobs = await jobService.getUnpaidJobs(req.profile.id);
  res.json(jobs);
});

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay. The amount
 *    should be moved from the client's balance to the contractor balance.
 */
app.post('/jobs/:jobId/pay', getProfile, async (req, res, next) => {
  const { jobId } = req.params;
  try {
    await jobService.pay(req.profile, jobId);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * Deposits money into the balance of a client, a client can't deposit
 *    more than 25% his total of jobs to pay. (at the deposit moment)
 */
app.post('/balances/deposit/:userId', getProfile, async (req, res, next) => {
  const { userId } = req.params;
  const { amount } = req.body;
  try {
    if (Number.parseInt(userId, 10) !== req.profile.id) {
      throw new ForbiddenError();
    }
    await profileService.depositMoney(req.profile, amount);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

/**
 * @return Returns the profession that earned the most money (sum
 *    of jobs paid) for any contactor that worked in the query time range.
 * Requires start and end date params in format yyyy-mm-dd
 */
app.get('/admin/best-profession', getProfile, async (req, res) => {
  const { start, end } = req.query;
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  validateDateRange(startDate, endDate);
  const jobs = await professionService.findBestProfessions(startDate, endDate);
  res.json(jobs);
});

/**
 * @return returns the clients the paid the most for
 *    jobs in the query time period. limit query parameter should be applied, default limit is 2.
 */
app.get('/admin/best-clients', getProfile, async (req, res) => {
  const DEFAULT_LIMIT = 2;
  const { start, end, limit = DEFAULT_LIMIT } = req.query;
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  validateDateRange(startDate, endDate);
  const jobs = await clientService.findBestClients(startDate, endDate, limit);
  res.json(jobs);
});

app.use(clientErrorHandler);

module.exports = app;
