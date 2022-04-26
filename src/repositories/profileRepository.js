const { sequelize } = require('../model');

function ProfileRepository() {
  return {
    async findById(profileId) {
      return sequelize.models.Profile.findOne({
        where: { id: profileId },
      });
    },
    /**
     * Transfer money from on profile to another in transaction
     * @param fromId        id of profile to transfer from
     * @param toId          id of profile to transfer to
     * @param amount        transfer amount
     * @param transaction   transaction to run
     */
    async transferMoney(fromId, toId, amount, transaction) {
      await Promise.all([
        sequelize.models.Profile.increment(
          { balance: -amount },
          { where: { id: fromId }, transaction },
        ),
        sequelize.models.Profile.increment(
          { balance: amount },
          { where: { id: toId }, transaction },
        ),
      ]);
    },

    async depositMoney(profileId, amount) {
      await sequelize.models.Profile.increment(
        { balance: amount },
        { where: { id: profileId } },
      );
    },
  };
}

const profileRepository = new ProfileRepository();

module.exports = { ProfileRepository, profileRepository };
