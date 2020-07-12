const LocalStrategy = require('passport-local').Strategy;
const User = require('../../models/User');

class Unauthorized extends Error {
  constructor(message) {
    super(message);
    this.status = 401;
  }
}


module.exports = new LocalStrategy(
    {usernameField: 'email', session: false},
    async function(email, password, done) {
      const user = await User.findOne({email});
      if (user) {
        const result = await user.checkPassword(password);
        if (result) {
          return done(null, user);
        }
        return done(null, false, 'Неверный пароль');
      }
      done(null, false, 'Нет такого пользователя');
    }
);
