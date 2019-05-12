const Koa = require('koa');
const { sequelize } = require('./user-model');
const { SERVER_PORT } = require('./config');

const app = new Koa();

app
  .use(require('./error-handler'))
  .use(require('koa-bodyparser')())
  .use(require('./api-service'))
  .use(require('./file-service'));


(async function start() {
  try {
    await sequelize.sync(); // подключаемся к БД и при необходимости создаём таблицу users
    console.log('Connection to DB established'); // eslint-disable-line no-console
  } catch (e) {
    console.error('Cannot connect to DB', e.message); // eslint-disable-line no-console
    process.exit(1);
  }

  app.listen(SERVER_PORT, () => console.log(`Server started on port ${SERVER_PORT}`)); // eslint-disable-line no-console
}());
