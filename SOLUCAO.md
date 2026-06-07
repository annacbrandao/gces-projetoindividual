# Relatório de Solução — Projeto Individual

- **Disciplina:** Gerência de Configuração e Evolução de Software (GCES — 2026/1)
- **Aluna:** Anna Clara Cardoso Evangelista Brandão
- **Matrícula:** 222006534
- **Repositório:** https://github.com/annacbrandao/gces-projetoindividual
- **URL de Produção:** https://gces-projetoindividual.onrender.com

---

## Visão Geral

Este documento descreve as decisões técnicas e ferramentas utilizadas para modernizar e automatizar o ciclo de vida do projeto **mk.js**, um jogo de luta multiplayer implementado com Node.js e HTML5 Canvas.

O projeto original utilizava dependências desatualizadas (Express 3.x e Socket.io 0.9.x, de 2013), incompatíveis com versões modernas do Node.js. A primeira etapa foi modernizar essas dependências antes de avançar para as fases de automação.

---

## Fase 1 — Containerização (DEV)

Para containerizar o ambiente de desenvolvimento, criei o arquivo `Dockerfile.dev` utilizando a imagem base `node:20-alpine`. O container instala as dependências do projeto e inicializa o servidor utilizando `nodemon`, que monitora alterações no código e reinicia o processo automaticamente, eliminando a necessidade de reinicializar o container manualmente durante o desenvolvimento. A imagem Alpine foi escolhida por ser significativamente mais leve que a imagem padrão do Node.js.

**Ferramentas:** Docker, Node.js 20, nodemon, Alpine Linux.

---

## Fase 2 — Docker Compose (DEV)

Criei o arquivo `docker-compose.yml` que orquestra dois serviços: a aplicação Node.js e um banco de dados PostgreSQL 16. O Compose garante que o banco suba antes da aplicação por meio da diretiva `depends_on` com `condition: service_healthy`.

Para a persistência, implementei um script `server/init.sql` que cria automaticamente as tabelas `games` e `game_events`, um módulo `server/db.js` com funções para registrar partidas, e um endpoint `GET /api/history` para consultar o histórico. As credenciais do banco foram isoladas em um arquivo `.env` (não versionado), com um `.env.example` como referência.

**Ferramentas:** Docker Compose, PostgreSQL 16, Node.js (pg driver).

---

## Fase 3 — CI: Build & Lint

Criei o arquivo `.github/workflows/ci.yml` com um pipeline que executa automaticamente a cada push ou pull request na branch `main`. O pipeline instala as dependências e executa o ESLint, configurado em `server/.eslintrc.json`. As regras incluem exigência de ponto-e-vírgula e aspas simples. Qualquer violação causa falha no pipeline.

**Ferramentas:** GitHub Actions, ESLint 8.

---

## Fase 4 — CI: Testes Unitários

Durante a análise do código original, identifiquei um bug real no arquivo `server/games.js`: a função `createGame` utilizava a variável `game` antes de sua declaração, o que por conta do hoisting do JavaScript resultava em `undefined`, fazendo a verificação de duplicatas nunca funcionar.

Utilizei esse bug para demonstrar o ciclo exigido:
1. **Primeiro commit:** criei `server/tests/games.test.js` com um teste que verifica a detecção de duplicatas. O CI falhou conforme esperado.
2. **Segundo commit:** corrigi o bug trocando `this._games[game]` por `this._games[id]`. O CI passou com 5/5 testes.

**Ferramentas:** Jest, GitHub Actions.

---

## Fase 5 — CI: Testes de Fuzzing

Criei o arquivo `server/tests/fuzz.test.js` com uma lista de entradas maliciosas: `null`, `undefined`, strings vazias, números, objetos, arrays, strings de 10.000 caracteres, injeção de SQL, path traversal e scripts de injeção HTML. Para cada entrada e para cada função pública do `GameCollection`, o teste verifica que nenhuma exceção é lançada. O resultado foi 59 testes passando.

**Ferramentas:** Jest, fuzzing manual.

---

## Fase 6 — Segurança: SAST & SCA

Para o SAST, configurei o **CodeQL** em `.github/workflows/codeql.yml`, que analisa o código JavaScript em busca de vulnerabilidades e publica os resultados na aba Security do repositório. O workflow executa a cada push e semanalmente.

Para o SCA, adicionei `npm audit --audit-level=high` ao pipeline de CI, que verifica vulnerabilidades de alta severidade nas dependências e falha o pipeline caso encontre alguma.

**Ferramentas:** CodeQL, npm audit, GitHub Actions.

---

## Fase 7 — Qualidade de Código: SonarCloud

Configurei o projeto no SonarCloud e criei `sonar-project.properties` com as configurações de fontes, testes e cobertura. O workflow `sonar.yml` executa os testes e envia os resultados para análise.

Métricas finais: Security Rating A, Reliability Rating A, Maintainability Rating A, 0 vulnerabilidades, 0 bugs, cobertura de 20,9% e 0% de duplicações. O Quality Gate passou.

**Ferramentas:** SonarCloud, Jest (coverage), GitHub Actions.

---

## Fase 8 — Containerização (PROD)

Criei dois Dockerfiles de produção. O `Dockerfile.prod` usa multi-stage build: na primeira etapa instala apenas dependências de produção; na segunda, copia apenas o resultado e roda com usuário sem privilégios. O `Dockerfile.nginx` usa `nginx:alpine` para servir os arquivos estáticos do frontend.

O `nginx/nginx.conf` configura proxy para Socket.io e API. O `docker-compose.prod.yml` orquestra os três serviços expondo apenas a porta 80 do Nginx externamente.

**Ferramentas:** Docker multi-stage build, Nginx Alpine, Node.js 20 Alpine.

---

## Fase 9 — Infraestrutura: Kubernetes & Terraform

Criei os manifestos Kubernetes na pasta `k8s/` cobrindo: namespace, secrets, PersistentVolumeClaim, Deployments e Services para Postgres, aplicação e Nginx, ClusterIssuer do Cert Manager e Ingress.

Para o Terraform, criei `terraform/` com `main.tf`, `variables.tf` e `outputs.tf` usando o provider `hashicorp/kubernetes`.

**Ferramentas:** Kubernetes, Terraform, Cert Manager, Let's Encrypt.

---

## Fase 10 — CD & Segurança de Rede

Para o CD, criei `.github/workflows/cd.yml` que autentica no GitHub Container Registry usando o `GITHUB_TOKEN` nativo e publica as imagens `gces-projetoindividual-app` e `gces-projetoindividual-nginx` automaticamente a cada push na main.

Para o HTTPS, o `cert-manager-issuer.yml` define um ClusterIssuer com Let's Encrypt. O `ingress.yml` usa as anotações `ssl-redirect` e `force-ssl-redirect` para redirecionar todo tráfego HTTP para HTTPS. A segurança de rede é garantida pela arquitetura: apenas o Ingress expõe portas externamente — os serviços de app e banco são ClusterIP, acessíveis apenas dentro do cluster.

**Ferramentas:** GitHub Actions, Docker Build Push Action, GitHub Container Registry, Cert Manager, Let's Encrypt, Nginx Ingress Controller.


---

## Expansão da Cobertura de Testes

Apos a integração com o SonarCloud, a cobertura inicial estava em 20,9%. Para aumentá-la significativamente, expandi o arquivo server/tests/games.test.js com testes que cobrem as partes mais complexas do games.js, que exigiam a criação de mock sockets - objetos que imitam o comportamento de conexões Socket.io reais sem depender de um servidor rodando.

Os mocks implementam os métodos emit, on, disconnect e trigger (para simular eventos recebidos), permitindo testar:

- Game.prototype.getId - retorno do identificador do jogo
- Game.prototype.addPlayer - aceitação do primeiro e segundo jogador, notificação via player-connected, e rejeição de um terceiro jogador
- Game.prototype._addHandlers - repasse bidirecional de eventos (event, life-update, position-update) entre os dois jogadores
- Game.prototype.endGame - desconexão do oponente e remoção do jogo da coleção ao desconectar qualquer um dos jogadores, e comportamento seguro quando chamado sem jogadores

O resultado final foi 100% de cobertura de statements, branches, funções e linhas no arquivo games.js, e 51,9% de cobertura geral reportada pelo SonarCloud.

---

## Deploy em Ambiente de Produção

A aplicacao foi publicada publicamente utilizando a plataforma Render, que oferece hospedagem gratuita com suporte a Docker e PostgreSQL.

O processo foi:

1. Criacao de uma instancia PostgreSQL gratuita no Render, que forneceu automaticamente uma DATABASE_URL de conexao
2. Criacao de um Web Service conectado ao repositorio GitHub, configurado para usar o Dockerfile.prod (multi-stage build)
3. Configuracao da variavel de ambiente DATABASE_URL com a string de conexao do banco
4. Correcao do Dockerfile.prod para incluir a pasta game/ no container, necessaria para o Express servir os arquivos estaticos do frontend

A URL pública do ambiente de produção é: https://gces-projetoindividual.onrender.com

O Render realiza redeploy automático a cada push na branch main, complementando o pipeline de CD já configurado no GitHub Actions.

Ferramentas: Render, Docker, PostgreSQL, GitHub Actions (CD automático).
