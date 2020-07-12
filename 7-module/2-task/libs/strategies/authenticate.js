const User = require('../../models/User');

module.exports = async function authenticate(strategy, email, displayName, done) {
  try {
    if (email) {
      let user = await User.findOneAndUpdate({email}, {displayName});
      if (!user) {
        user = new User({email, displayName});
        await user.save();
      }
      return done(null, user);
    }
    done(null, false, `Не указан email`);
  } catch (e) {
    done(e);
  }
};
