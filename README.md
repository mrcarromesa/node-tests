# Testes utilizando o jest

- TDD

- Red | Green | Refatoring

- Framework Jest bem completo

- Verificamos cobertura dos testes utilizando o coverage.

---


- Para iniciar os testes utilizando o node primeiramente utilizamos o jest como dependencia de desenvolvimento:

```bash
yarn add jest -D
```

- E iniciamos utilizando o comando:

```bash
yarn jest --init
```

_ Ele irá efetuar algumas perguntas:

- `Would you like to use Jest when running "test" script in "package.json"?`

- Resposta: Y

- `Choose the test environment that will be used for testing`

- Selecionar o `node`

- `Do you want Jest to add coverage reports?`

- Resposta: Y

- `Automatically clear mock calls and instances between every test?`

- Resposta: y

- Será gerado o arquivo `jest.config.js`

- Algumas configurações que podemos realizar nesse arquivo...

- Podemos definir o `bail` para `1`, para assim que um erro for encontrado ele pare de executar os testes.

- O `collectCoverage` podemos definir `true`

- Em `collectCoverageFrom` podemos definir quais arquivos ele irá verificar os testes se a cobertura está ok, em geral utilizamos a pasta `app`, pois arquivo de rotas por exemplo não é responsabilidade dos tests verificar se isso está funcionando, dessa forma podemos adicionar algo como `collectCoverageFrom: ['src/app/**/*.js'],` ou seja ele irá verificar todos os arquivos dentro da pasta `src/app` incluindo todos os subniveis e todos os arquivos `.js`

- Em `coverageReporters: ['json', 'text', 'lcov', 'clover'],` podemos selecionar `text` e `lcov`

- Ajustar também aqui, que será o caminho de onde estão os testes:

```js
// The glob patterns Jest uses to detect test files
  // testMatch: [
  //   "**/__tests__/**/*.[jt]s?(x)",
  //   "**/?(*.)+(spec|test).[tj]s?(x)"
  // ],
```

- Por padrão ele busca qualquer pasta dentro do projeto com `__tests__`, porém o melhor é possuír apenas uma pasta para testes
- Dessa forma criamos na raiz do projeto uma pasta chamada `__tests__`

- E ajustamos no `jest.config.js`:

```js
// The glob patterns Jest uses to detect test files
testMatch: [
  "**/__tests__/**/*.test.js",
],
```

- Ajusta o caminho da pasta onde deverá ser salvo o coverage:

```js
coverageDirectory: '__tests__/coverage',
```


- Por padrão o jest vem com require/export, para utilizar o surcrase instalamos essa dependencia:

```bash
yarn add --dev @sucrase/jest-plugin
```

- No arquivo `jest.config.js` procuramos por `transform` e alteramos para:

```js
"transform": {
  ".(js|jsx|ts|tsx)": "@sucrase/jest-plugin"
},
```

- No arquivo `nodemon.json` adicionamos um `ignore`, para ignorar a pasta de testes para ele não restartar o servidor quando alteramos os tests:

```json
"ignore": [
    "__tests__"
  ]
```

- Para obter o intelisence do jest no vscode precisamos instalar a definição de tipos:

```bash
yarn add @types/jest -D
```

- Exemplo de um test:

```js
function soma(a, b) {
  return a + b;
}

// na descricao colocamos o que esperamos que o test retorne basicamente
test('if i call soma function with 4 and 5 it shoud return 9', () => {
  const result = soma(5, 4);

  expect(result).toBe(9);
});

```

- É importante criar variaveis de ambiente para trabalhar com testes para que o ambiente de testes como base de dados não interfira no de produção.

- Podemos criar o arquivo `.env.test`

- No caso da base de dados podemos utilizar a baser de dados sqlite, pois basicamente ela gera um arquivo e não precisamos instalar nada na máquina.

- Dentro do arquivo `.env.test` inserimos o seguinte para configurar a base de dados:

```js
DB_DIALECT=sqlite
```

- No arquivo `src/config/database.js` adicionamos a condição para trabalhar com essa variavel de ambiente:

```js

require('dotenv/config');

module.exports = {
  dialect:  process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};

```

- Se a variavel DB_DIALECT não tiver definida por padrão será utilizado o `postgres` como informado acima.


- Para trabalhar com a base de dados sqlite precisamos informar ao sequelize o caminho do arquivo, isso pode ser em produção também pois como em produção ele irá utilizar outra base de dados quanto a isso não haverá problemas nesse caso.

```js
require('dotenv/config');

module.exports = {
  dialect:  process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  storage: './__tests__/database.sqlite',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true,
  },
};
```


- O storage ele é a partir da onde executa o comando de teste.


- Agora precisamos informar a aplicação qual env deverá ser carregado, para tal podemos criar um arquivo `src/bootstrap.js`:

```js
import dotenv from 'dotenv';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

```

- Por fim no arquivo `src/app.js` alteramos:

```js
import 'dotenv/config';
```

- Para;

```js
import './bootstrap';
```

- Dentro de `src/config/database.js` alteramos:

```js
require('dotenv/config');
```

- Para:

```js
require('../bootstrap');

```

**Por algum motivo não conseguir fazer dessa forma no arquivo `src/config/database.js`**

- Precisei inserir direto nele isso:

```js
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});
```

---

- Agora para altera a variavel `NODE_ENV` podemos setar da seguinte forma no arquivo `package.json`:

```json
"test": "NODE_ENV=test jest"
```

- Para window é necessário adicionar:

```json
 "test": "NODE_ENV=test jest"
```


- Para efetuar testes com registro de usuários primiero precisamos criar a migration:

```bash
yarn sequelize migration:create --name=create_users
```

- Até aí tudo bem...

- Porém se executarmos essa migration ela irá executar no ambiente de produção, tem que haver uma forma de ao executarmos os testes as migrations sejam executadas e ao finalizar os testes realizar um rollback de todas as migrations;

- Para isso podemos utilizar o `package.json` para rodar comandos que serão executados antes e depois de determinado comando, para isso utilizamos prefixos:

- `preNOMEDOCOMANDO` - Irá executar antes do `NOMEDOCOMANDO`
- `postNOMEDOCOMANDO` - Irá executar após o `NOMEDOCOMANDO`

- Nesse caso podemos ajustar o `package.json` na parte de scripts dessa forma:

```json
"scripts": {
    "pretest": "NODE_ENV=test sequelize db:migrate",
    "test": "NODE_ENV=test jest",
    "posttest": "NODE_ENV=test sequelize db:migrate:undo:all",
  },
```

- Dessa forma antes dos testes ele irá executar as migrates e após os testes ele irá remover as migrates para poder realizar as migrates todas novamente quando for realizado so testes.

- Para poder utilizar o sqlite precisamos instalar uma dependencia em desenvolvimento:

```bash
yarn add sqlite3 -D
```

- Foi criado o arquivo `src/app/models/User.js`

- E ajustado o arquivo `src/database/index.js`

- Tudo pronto iremos realizar testes de integração que são testes que pode lidar com integrações, chamadas de api, banco de dados...

- Para isso criamos a pasta `__tests__/integration/user.test.js`

---

## Categorizar os testes

- Utilizamos o `describe()` para categorizar os testes e no lugar do `test()` utilizamos o `it()` conforme feito no arquivo `__tests__/integration/user.test.js`


- Uma biblioteca para realizar requisições como o axios é o `supertest`:

```bash
yarn add supertest -D
```

- os arquivos de incialização do servidor foi dividido entre `server.js` e `app.js`,
No `server.js` foi adicionado o listener para habilitar o servidor e o `app` a instancia da aplicação, agora que temos isso dividido conseguimos realizar os tests sem precisar que a aplicação esteja rodando, o que o test precisa é apenas da instancia do `app` no caso o `app.js`

- dessa forma importamos o app dentro de `__tests__/integration/user.test.js` se realizarmos os testes agora irá falhar pois não temos a rota post que retorna o id

- Para isso no arquivo `src/routes.js` adicionamos:

```js
routes.post('/users', (req, res) => {
  return res.json({ id: 1 });
});
```

- Dessa forma inserinido fixo já irá funcionar, esse é o conceito de tdd, fazer funcionar e depois refatorar o código.

- Agora vamos criar o arquivo `src/app/controller/UserController.js`

---

## Testando e-mail duplicado na aplicação

- Dentro do arquivo `__tests__/integration/user.test.js` testamos se o e-mail está duplicado:

```js
it('should not be able register with duplicated email', async () => {
    await request(app)
      .post('/users')
      .send({
        name: 'Teste',
        email: 'teste@test.com.br',
        password_hash: '123456',
      });

    const response = await request(app)
      .post('/users')
      .send({
        name: 'Teste',
        email: 'teste@test.com.br',
        password_hash: '123456',
      });

    expect(response.status).toBe(400);
  });
```

- A primeira execução ele irá permitir, dessa forma precisamos ajustar no `src/app/controllers/UserController.js`

```js
const { email } = body;

const checkEmail = await User.findOne({ where: { email } });

if (checkEmail) {
  return res.status(400).json({ error: 'Duplicated E-mail' });
}
```

- Ok até aí tudo bem parece que dará certo, porém temos um problema, o teste anterior já inseriu a informação no banco, então o ideal é que para cada teste a base de dados seja limpa para permitir inserir novos registros, para isso podemos criar um arquivo que irá auxiliar nisso `__tests__/util/truncate.js`:

```js
import database from '../../src/database'; // importamos todos os models que estão no arquivo index.js dessa pasta importada

export default function truncate() {
  // Nos permite ter varios async await
  return Promise.all(
    Object.keys(database.connection.models).map(key => {
      return database.connection.models[key].destroy({
        truncate: true,
        force: true,
      })
    })
  )
}
```

- Por fim no arquivo `__tests__/integration/user.test.js` podemos utilizar o seguinte para chamar o truncate:

```js
import truncate from '../util/truncate';

// ...

// Utilizamos metodo auxilar do jest que irá executar antes de cada test:
// Antes de começar cada um dos tests
beforeEach(async () => {
  await truncate();
});
```


---

## Hash password

- Criar o test de password no arquivo `__tests__/user.test.js`:

```js
it('shoud be encrypt user password when new user created', async () => {
  const user = await User.create({
    name: 'Teste',
    email: 'teste@test.com.br',
    password: '123456',
  });

  const compareHash = await bcrypt.compare('123456', user.password_hash);

  expect(compareHash).toBe(true);
});
```

- Utilizar a dependencia `bcryptjs`:

```bash
yarn add bcryptjs
```

- Importar ele no arquivo de test.

- Se executarmos o test ocorrerá erro, é necessário realizar ajustes no arquivo `src/app/models/User.js`:


```js
class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      { sequelize }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }
}
```

- Agora nos tests podemos alterar o `password_hash` para `password`

- uma dica, o sequelize exibe o log das consultas, para remover isso adicionamos em `src/config/database.js`:

```js
module.exports = {
  // ...
  logging: false,
  // ...
}
```


---

## Dados ficticios

- Para utilizar dados ficticios podemos utilizar a seguinte dependencia:

```bash
yarn add factory-girl faker -D
```

- Criar o arquivo `__tests__/factory.js`:

```js
import faker from 'faker';
import { factory } from 'factory-girl';
import User from '../src/app/models/User';

factory.define('User', User, {
  name: faker.name.findName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

export default factory;

```

- Dados que podem ser utilizados com o faker pode ser encontrados em [Faker](https://github.com/Marak/Faker.js#readme)

- Alteramos o arquivo `__tests__/integration/user.test.js` ao invés de utilizar o model `User` podemos chamar o factory:

```js
// ...
import factory from '../factory';
// ...
// Ao inves de utilizar o model user utilizamos factory
const user = await factory.create('User', {
  password: '123456', // Como iremos precisar nesse caso comparar a senha precisamos manter isso
});

const compareHash = await bcrypt.compare('123456', user.password_hash);

expect(compareHash).toBe(true);
// ...


```


- No segundo testes como queremos enviar os dados do usuario para que a api crie simulando uma requisição a api utilizamos o seguinte:

```js
const user = await factory.attrs('User');

const response = await request(app)
  .post('/users')
  .send(user);
```

- Dessa forma podemos utilizar o factory girl para cada model para geração de dados aleatorios seja para 1 registro ou vários registros
