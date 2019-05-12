const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const { POSTGRES } = require('./config');

const sequelize = new Sequelize(POSTGRES.DB_NAME, POSTGRES.USER, POSTGRES.PASSWORD, {
  host: POSTGRES.HOST,
  port: POSTGRES.PORT,
  dialect: 'postgres',
});

class User extends Sequelize.Model {
  comparePasswords(password) {
  // проверка переданного пароля на совпадение с хешированным сохранённым
    return bcrypt.compareSync(password, this.password);
  }
}
User.init({
  login: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: { msg: 'указанный логин уже занят' },
    validate: {
      notEmpty: { msg: 'требуется указать логин' },
      notNull: { msg: 'требуется указать логин' },
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'требуется указать пароль' },
      notNull: { msg: 'требуется указать пароль' },
    },
  },
}, {
  hooks: {
    beforeCreate: (user) => { // перед сохранением в БД хешируем пароль
      const salt = bcrypt.genSaltSync(10);
      user.password = bcrypt.hashSync(user.password, salt); // eslint-disable-line no-param-reassign
    },
  },
  sequelize,
  modelName: 'user',
  timestamps: false,
});

module.exports = { sequelize, User };
