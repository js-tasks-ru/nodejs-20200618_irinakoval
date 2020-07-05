const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname+ '/public')));
app.use(require('koa-bodyparser')());


const Router = require('koa-router');
const router = new Router();
const resolves = [];

router.get('/subscribe', async (ctx, next) => {
  const promise = new Promise(async (resolve) => {
    resolves.push(resolve);
  });
  await promise.then((data) => {
    ctx.res.statusCode = 200;
    ctx.body = data;
  });
});

router.post('/publish', async (ctx, next) => {
  ctx.res.statusCode = 200;
  const {message} = ctx.request.body;
  if (message) {
    resolves.forEach((resolve) => resolve(message));
  }
});

app.use(router.routes());

module.exports = app;
