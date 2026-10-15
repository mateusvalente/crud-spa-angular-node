# CRUD SPA - Angular + Node.js + PostgreSQL + Docker

Exemplo didático de CRUD em arquitetura SPA.

## Tecnologias

- Angular 22
- Node.js 24
- Express
- PostgreSQL
- Docker Compose

## Arquitetura

```text
Navegador
   |
   | Angular SPA
   | HTTP / JSON
   v
Node.js + Express
   |
   | SQL
   v
PostgreSQL
```

O Angular é responsável pela interface e pelas rotas do navegador.

O Node.js não renderiza HTML. Ele funciona apenas como uma API REST,
recebendo e devolvendo JSON.

## Estrutura

```text
crud-spa-angular-node/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   └── products.js
│   │   ├── db.js
│   │   └── server.js
│   ├── Dockerfile
│   └── package.json
│
├── db/
│   └── init.sql
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── product-form/
│   │   │   │   └── product-list/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── app.component.*
│   │   │   ├── app.config.ts
│   │   │   └── app.routes.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   ├── nginx.conf
│   ├── angular.json
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

## Dockerfiles

No modo de desenvolvimento, os Dockerfiles não copiam o código para a imagem.

O código é montado por bind mount:

```yaml
- ./frontend:/app
```

e:

```yaml
- ./backend:/app
```

Os `node_modules` ficam em volumes separados:

```yaml
- frontend_node_modules:/app/node_modules
- backend_node_modules:/app/node_modules
```

O PostgreSQL possui volume persistente:

```yaml
postgres_data:/var/lib/postgresql/data
```

O `frontend/Dockerfile.prod` compila o Angular e copia o resultado para uma
imagem Nginx. Essa imagem serve os arquivos gerados, sem executar `ng serve`.

## Executar em desenvolvimento

Na raiz do projeto:

```bash
docker compose up --build
```

Abra:

```text
http://localhost:4200
```

O front-end de desenvolvimento usa `ng serve` na porta 4200.

## Executar o build de produção

Na raiz do projeto, execute:

```bash
docker compose --profile prod up -d --build frontend-prod
```

Abra `http://localhost:4300`. O comando compila o Angular, inicia o Nginx e
sobe também o backend e o PostgreSQL, se necessário. O Nginx encaminha `/api/`
para o backend e retorna `index.html` nas rotas da SPA. O serviço de
desenvolvimento na porta 4200 não é iniciado por esse comando.

Para parar apenas o front-end de produção:

```bash
docker compose --profile prod stop frontend-prod
```

API:

```text
http://localhost:3000/api/products
```

## Rotas da SPA

```text
/produtos
/produtos/novo
/produtos/:id/editar
```

Essas são rotas do Angular. Ao navegar entre elas, a página completa
não é recarregada.

## Rotas da API

```text
GET    /api/products
GET    /api/products/:id
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

## Testar a característica SPA

1. Abra o DevTools do navegador.
2. Vá para a aba Network.
3. Navegue entre "Produtos" e "Novo produto".
4. Perceba que o navegador não solicita um novo documento HTML completo.
5. Ao listar/salvar produtos, o Angular chama `/api/products` e recebe JSON.

## Apagar o banco e começar novamente

```bash
docker compose down -v
docker compose up --build
```

O script `db/init.sql` é executado somente na criação inicial
do volume do PostgreSQL.
