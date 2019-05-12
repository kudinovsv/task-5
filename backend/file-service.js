const serve = require('koa-better-serve');
const compose = require('koa-compose');
const fs = require('fs');

const urlChecker = async function urlChecker(ctx, next) {
/**
 * корректировка имени запрашиваемоо файла:
 * корень сайта => main-page.html
 * несуществующий файл => other-pages.html
 */
  if (ctx.url === '/') ctx.url = '/main-page.html';
  else if (!fs.existsSync(`./frontend${ctx.url}`)) ctx.url = '/other-pages.html';

  await next();
};

module.exports = compose([urlChecker, serve('./frontend', '/')]);
