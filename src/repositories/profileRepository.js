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
     * @param fromId    id of profile to transfer from
     * @param toId      id of profile to transfer to
     * @param amount    transfer amount
     * @return {Promise<boolean>} true if transfer was succeeded, false otherwise
     */
    async transferMoney(fromId, toId, amount) {
      const transaction = await sequelize.transaction();

      try {
        await sequelize.models.Profile.increment(
          { balance: -amount },
          { where: { id: fromId }, transaction },
        );
        await sequelize.models.Profile.increment(
          { balance: amount },
          { where: { id: toId }, transaction },
        );

        await transaction.commit();
        return true;
      } catch (error) {
        await transaction.rollback();
        return false;
      }
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
