const jwt = require('jsonwebtoken');
const { User } = require('./user-model');
const { JWT_SECRET } = require('./config');

const createToken = function createToken(user) {
// создания токена по id пользователя
  return jwt.sign({ id: user.id }, JWT_SECRET);
};

const userFinder = async function userFinder(ctx, next) {
/**
 * извлечение из токена переданного в хедере authorization id пользователя,
 * поиск пользователя в БД, и сохранение его в контекст
 */
  const { authorization: token } = ctx.headers;

  if (token === undefined) {
    ctx.throw(401, { message: 'Unauthorized' });
  } else {
    try {
      const { id } = await jwt.verify(token, JWT_SECRET);

      ctx.user = await User.findByPk(id);
      if (!ctx.user) {
        ctx.throw();
      }
    } catch (e) {
      ctx.throw(401, { message: 'Unauthorized. Invalid Token' });
    }
  }

  await next();
};

module.exports = { createToken, userFinder };
