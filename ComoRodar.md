# Como Rodar o Projeto

Este é um jogo de luta estilo Mortal Kombat implementado com HTML5 Canvas e Node.js. Possui três modos de jogo:

- **Básico** — um jogador ativo e um inativo
- **Multijogador** — dois jogadores no mesmo computador
- **Rede** — dois jogadores conectados via servidor Node.js

---

## Pré-requisitos

- Docker e Docker Compose
- Git

---

## Ambiente de Desenvolvimento (com Docker)

### 1. Configure as variáveis de ambiente

    cp .env.example .env

### 2. Suba os containers

    docker compose up --build

O servidor sobe na porta 55555 com hot-reload. O banco de dados PostgreSQL sobe automaticamente.

### 3. Acesse o jogo

Abra http://localhost:55555 no navegador.

Para jogar em modo rede, abra duas abas:
- Aba 1: responda yes ao host e defina um nome de jogo (ex: teste)
- Aba 2: responda no ao host e use o mesmo nome de jogo

### 4. Parar os containers

    docker compose down

---

## Ambiente de Produção (com Nginx)

    docker compose -f docker-compose.prod.yml up --build

Acesse http://localhost (porta 80).

---

## Rodar sem Docker (modo básico/multijogador)

Abra diretamente o arquivo game/index.html em qualquer navegador moderno.

Atenção: o modo rede não funciona sem o servidor Node.js.

---

## Rodar o servidor manualmente (sem Docker)

    cd server
    npm install
    node server.js

O servidor sobe na porta 55555. Acesse http://localhost:55555.

---

## Testes

    cd server
    npm install
    npm test
