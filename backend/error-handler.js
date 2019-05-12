const prepareErrorMsg = function prepareErrorMsg(errors) {
  const rawMsg = errors.map(err => err.message).join(', ');
  return `${rawMsg.charAt(0).toUpperCase()}${rawMsg.slice(1)}.`;
};

module.exports = async function errorHandler(ctx, next) {
// обработчик ошибок в последующих мидлварах
  try {
    await next();
  } catch ({
    status = 500, message = 'Server Error', name, errors,
  }) {
    if (['SequelizeUniqueConstraintError', 'SequelizeValidationError'].includes(name)) {
      ctx.status = 400;
      ctx.body = { message: prepareErrorMsg(errors) };
    } else {
      ctx.status = status;
      ctx.body = { message };
    }
  }
};
