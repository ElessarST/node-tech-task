const { HttpStatus } = require('../const/httpStatusCode');

const getProfile = async (req, res, next) => {
  const { Profile } = req.app.get('models');
  const profile = await Profile.findOne({
    where: { id: req.get('profile_id') || 0 },
  });
  if (!profile) {
    res.status(HttpStatus.Unauthorized).end();
    return;
  }
  req.profile = profile;
  next();
};

module.exports = { getProfile };
