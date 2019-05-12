const Router = require('koa-router');
const compose = require('koa-compose');
const { User } = require('./user-model');
const { createToken, userFinder } = require('./token-service');

const router = new Router({ prefix: '/api' });

router
  .post('/signup', async (ctx) => {
  // регистрация
    const { login, password } = ctx.request.body;
    const user = await User.create({ login, password });
    const token = await createToken(user);
    ctx.body = { result: token };
  })

  .post('/signin', async (ctx) => {
  // вход
    const { login, password } = ctx.request.body;

    const user = await User.findOne({ where: { login } });

    if (!user) {
      ctx.throw(400, { message: 'Пользователь не найден.' });
    }

    if (!user.comparePasswords(password)) {
      ctx.throw(400, { message: 'Неверный пароль.' });
    }

    const token = await createToken(user);
    ctx.body = { result: token };
  })

  .get('/login', userFinder, (ctx) => {
  // возвращение логина аутентифицированному пользователю
    ctx.body = { result: ctx.user.login };
  })

  .get('/users', userFinder, async (ctx) => {
  // возвращение списка пользователей аутентифицированному пользователю
    const { page = 1, per_page: perPage = 5 } = ctx.request.query;

    const res = await User.findAndCountAll({
      attributes: ['id', 'login'],
      offset: (page - 1) * perPage,
      limit: perPage,
    });

    ctx.body = {
      result: {
        total_pages: Math.ceil(res.count / perPage),
        users: res.rows,
      },
    };
  });

const apiTerminator = async function apiTerminator(ctx, next) {
// запрещаем обработку в последующих мидлварах неподдерживаемых запросов к api
  if (!ctx.url.startsWith('/api/')) await next();
};

module.exports = compose([router.routes(), apiTerminator]);
