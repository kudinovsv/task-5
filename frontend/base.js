// общий файл для обеих страниц

const encodeQueryString = function encodeQueryString(params) {
  const keys = Object.keys(params);
  return keys.length !== 0
    ? `?${keys.map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&')}`
    : '';
};

const fetcher = {
  async fatalError() {
    alert('Что-то пошло не так. Попробуйте обновить страницу.');
    await new Promise(() => {}); // никогда не вернёмся, чтобы заморозить любой процессинг
  },

  async get(path, params = {}) {
    const url = `/api/${path}${encodeQueryString(params)}`;
    let response;
    let res;
    try {
      response = await fetch(url, { headers: { Authorization: localStorage.getItem('auth') } });
      res = await response.json();
    } catch (e) {
      await this.fatalError();
    }

    if (response.status === 200) return res.result;
    if (response.status === 401) {
      localStorage.removeItem('auth'); // токен некорректный - сотрём его
      throw new Error();
    } else return this.fatalError();
  },

  async post(path, params) {
    const url = `/api/${path}`;
    let response;
    let res;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      res = await response.json();
    } catch (e) {
      await this.fatalError();
    }

    if (response.status === 200) return res.result;
    if (response.status === 400) {
      throw new Error(res.message);
    } else {
      return this.fatalError();
    }
  },
};

Vue.component('NavBar', {
  data() {
    return {
      login: null,
      loading: true,
    };
  },
  async created() {
    if (typeof localStorage.getItem('auth') === 'string') { // если есть токен, запросим логин
      try {
        this.login = await fetcher.get('login');
      } catch (e) {
        /**
         * здесь мы можем поймать только ошибку аутентификации, тогда this.login останется null,
         * что как раз и надо в данной ситуации
         */
      }
    }
    this.loading = false;
  },
  props: {
    mainPage: Boolean, // режим работы: на главной странице или на второй
  },
  methods: {
    signOut() {
      localStorage.removeItem('auth');
      this.login = null;
      if (!this.mainPage) { // при логауте не с главной страницы, перейдём на главную
        document.location.href = '/';
      }
    },
    setLogin(login) { // метод для установки логина используемый другими компонентами
      this.login = login;
    },
  },
  template: `
    <nav class="clearfix">
        <ul v-if="mainPage">
            <li><a class="nav-link-active">Главная</a></li>
            <li><a href="/userlist">Список пользователей</a></li>
        </ul>
        <ul v-else>
            <li><a href="/">Главная</a></li>
            <li><router-link to="/userlist">Список пользователей</router-link></li>
        </ul>        
        <div v-if="!loading" class="auth">
            <template v-if="login">
                <button v-on:click="signOut" class="btn btn-info">Выйти</button>
                <span class="login-label">
                    Вы вошли как
                    <span class="login">
                        {{ login }}
                    </span>
                </span>
            </template>
            <template v-else-if="mainPage">
                <a class="btn btn-info" href="/signup">Регистрация</a>
                <a class="btn btn-info" href="/signin">Войти</a>
            </template>
            <template v-else>
                <router-link to="/signup" class="btn btn-info">Регистрация</router-link>
                <router-link to="/signin" class="btn btn-info">Войти</router-link>
            </template>            
        </div>
    </nav>  
`,
});
