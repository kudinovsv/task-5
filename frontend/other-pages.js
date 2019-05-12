const LoginForm = Vue.component('LoginForm', {
// компонент используемый как на странице входа, так и на странице регистрации
  data() {
    return {
      login: '',
      password: '',
    };
  },
  props: [
    'request', // запрос к api
    'header', // заголовок формы
    'btnText', // текст на кнопке
    'successfulMsg', // сообщение выдаваемое при успешном запросе к api
  ],
  methods: {
    async doRequest() {
      try {
        // запрашиваем токен
        localStorage.setItem('auth', await fetcher.post(this.request, {
          login: this.login,
          password: this.password,
        }));

        this.$emit('set-login', this.login); // устанавливаем логин в компоненте NavBar
        alert(this.successfulMsg);

        // если был редирект со страницы списка пользователей - переходим на неё, иначе на главную
        if (window.redirectedFromUserList) this.$router.push('userlist');
        else document.location.href = '/';
      } catch (e) {
        alert(e.message);
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
    /**
     * сброс логина и пароля, т.к. при переходе между страницами регистрации и входа компонент
     * не пересоздаётся, и текст в полях ввода сохраняется
     */
      vm.login = ''; // eslint-disable-line no-param-reassign
      vm.password = ''; // eslint-disable-line no-param-reassign
    });
  },
  template: `
    <form>
        <h1>{{ header }}</h1>
        <div class="fields-block">
            <div class="form-group">
                <label class="control-label" for="login">
                    Логин                
                </label>
                <input v-model="login" id="login" class="form-control">
            </div>
            <div class="form-group">
                <label class="control-label" for="password">
                    Пароль                
                </label>
                <input v-model="password" id="password" type="password" class="form-control">
            </div> 
            <div class="spacer"></div>
            <button v-on:click="doRequest" class="btn btn-info" type="button">
                {{ btnText }}
            </button>
        </div>       
    </form>
`,
});

Vue.component('Pagination', {
  props: ['currentPage', 'totalPages'],
  template: `
    <ul class='pagination'>
        <li v-bind:class="{ disabled: currentPage === 1 }">
          <span v-if="currentPage === 1">«</span>
          <a v-else v-on:click="$emit('gotoPage', currentPage - 1)">«</a>
        </li>
        <li v-for="i in totalPages" v-bind:class="{ active: currentPage === i }">
          <span v-if="currentPage === i">{{ i }}</span>
          <a v-else v-on:click="$emit('gotoPage', i)">{{ i }}</a>      
        </li>
        <li v-bind:class="{ disabled: currentPage === totalPages }">
          <span v-if="currentPage === totalPages">»</span>
          <a v-else v-on:click="$emit('gotoPage', currentPage + 1)">»</a>
        </li>        
    </ul>      
`,
});

const UserList = Vue.component('Signin', {
  data() {
    return {
      currentPage: null,
      totalPages: null,
      users: null,
    };
  },
  created() {
    this.gotoPage(1);
  },
  methods: {
    async gotoPage(page) {
      try {
        const res = await fetcher.get('users', { page });

        this.currentPage = page;
        this.totalPages = res.total_pages;
        this.users = res.users;
      } catch (e) {
        // здесь может пойматься только ошибка аутентификации
        alert('Для просмотра списка пользователей необходимо аутентифицироваться.');
        this.$emit('set-login', null);
        this.$router.push('signin');
      }
    },
  },
  template: `
    <div v-if="currentPage" class="user-list">
        <h1>Зарегистрированные пользователи</h1>
        <table class="table table-bordered table-striped">
            <thead>
                <tr>
                    <th>Id</th>
                    <th>Логин</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="user in users">
                    <td>{{ user.id }}</td>
                    <td>{{ user.login }}</td>
                </tr>
            </tbody>
        </table>
        <pagination
            v-if="totalPages > 1" 
            v-bind:currentPage="currentPage" 
            v-bind:totalPages="totalPages"
            v-on:gotoPage="gotoPage($event)"
         ></pagination>
    </div>
`,
});

const routes = [
  {
    path: '/signup',
    component: LoginForm,
    props: {
      request: 'signup',
      btnText: 'Зарегистрироваться',
      header: 'Регистрация',
      successfulMsg: 'Успешная регистрация. Добро пожаловать!',
    },
  },
  {
    path: '/signin',
    component: LoginForm,
    props: {
      request: 'signin',
      btnText: 'Войти',
      header: 'Вход',
      successfulMsg: 'Добро пожаловать!',
    },
  },
  {
    path: '/userlist',
    component: UserList,
    beforeEnter: (to, from, next) => {
    // не аутентифицированных перенаправляем на страницу входа
      if (typeof localStorage.getItem('auth') === 'string') next();
      else {
        alert('Для просмотра списка пользователей необходимо аутентифицироваться.');
        // запоминаем сей факт, чтобы после успешного входа понять куда перейти дальше
        window.redirectedFromUserList = true;
        next('/signin');
      }
    },
  },
];

const router = new VueRouter({ routes, mode: 'history', linkActiveClass: 'nav-link-active' });

new Vue({ router, el: '#app' }); // eslint-disable-line no-new
