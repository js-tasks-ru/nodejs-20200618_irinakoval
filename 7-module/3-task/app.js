const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const Session = require('./models/Session');
const uuid = require('uuid/v4');
const handleMongooseValidationError = require('./libs/validationErrors');
const mustBeAuthenticated = require('./libs/mustBeAuthenticated');
const {login} = require('./controllers/login');
const {oauth, oauthCallback} = require('./controllers/oauth');
const {me} = require('./controllers/me');

const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      console.error(err);
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

app.use(async (ctx, next) => {
  ctx.login = async function(user) {
    const token = uuid();

    let session = await Session.findOneAndUpdate({user: user._id}, {token, lastVisit: new Date()});
    if (!session) {
      session = new Session({token, user: user._id, lastVisit: new Date()});
      await session.save();
    }
    return token;
  };

  const authorizationHeader = ctx.get('Authorization');
  if (authorizationHeader) {
    const token = authorizationHeader.split(' ')[1];
    if (token) {
      const session = await Session.findOneAndUpdate(
          {token: 'token'},
          {lastVisit: new Date()},
      ).populate('user');
      if (!session) {
        ctx.status = 401;
        ctx.body = {error: 'Неверный аутентификационный токен'};
        return;
      }
      ctx.user = session.user;
    }
    return next();
  }

  return next();
});

const router = new Router({prefix: '/api'});

router.use(async (ctx, next) => {
  const header = ctx.request.get('Authorization');
  if (!header) return next();

  return next();
});

router.post('/login', login);

router.get('/oauth/:provider', oauth);
router.post('/oauth_callback', handleMongooseValidationError, oauthCallback);

router.get('/me', mustBeAuthenticated, me);

app.use(router.routes());

// this for HTML5 history in browser
const fs = require('fs');

const index = fs.readFileSync(path.join(__dirname, 'public/index.html'));
app.use(async (ctx) => {
  if (ctx.url.startsWith('/api') || ctx.method !== 'GET') return;

  ctx.set('content-type', 'text/html');
  ctx.body = index;
});

module.exports = app;
