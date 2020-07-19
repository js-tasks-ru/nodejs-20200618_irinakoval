const uuid = require('uuid/v4');
const User = require('../models/User');
const sendMail = require('../libs/sendMail');

module.exports.register = async (ctx, next) => {
  const {email, displayName, password} = ctx.request.body;
  try {
    let user = await User.findOne({email: email});
    if (user) {
      ctx.status = 400;
      ctx.body = {errors: {email: 'Такой email уже существует'}};
      return;
    }
    const verificationToken = uuid();
    user = new User({
      email,
      displayName,
      verificationToken,
    });
    await user.setPassword(password);
    await user.save();
    await sendMail({
      template: 'confirmation',
      locals: {token: verificationToken},
      to: email,
      subject: 'Подтвердите почту',
    });
    ctx.status = 200;
    ctx.body = {status: 'ok'};
  } catch (e) {
    ctx.status = e.status;
    ctx.body = {error: e.message};
  }
};

module.exports.confirm = async (ctx, next) => {
  const user = await User.findOne(
      {verificationToken: ctx.request.body.verificationToken}
  );
  if (user) {
    user.verificationToken = undefined;
    await user.save();
    const token = await ctx.login(user);
    ctx.body = {token};
    return;
  }
  ctx.status = 400;
  ctx.body = {error: 'Ссылка подтверждения недействительна или устарела'};
};
