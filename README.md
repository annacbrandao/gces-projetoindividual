# gces-projetoindividual

Projeto individual da disciplina de **Gerência de Configuração e Evolução de Software (GCES - 2026/1)**.

A aplicação base é o **mk.js**, um jogo de luta com Backend em Node.js/Express e Frontend em HTML5 Canvas/JavaScript, com suporte a modo multiplayer em rede via Socket.io.

**URL pública:** https://gces-projetoindividual.onrender.com

## Pré-requisitos

- Docker e Docker Compose
- Git

## Ambiente de Desenvolvimento

### 1. Clone o repositório

    git clone https://github.com/annacbrandao/gces-projetoindividual.git
    cd gces-projetoindividual

### 2. Configure as variáveis de ambiente

    cp .env.example .env

### 3. Suba os containers

    docker compose up --build

### 4. Acesse a aplicação

Abra o navegador em http://localhost:55555

Para jogar em modo rede, abra duas abas:
- Aba 1: responda "yes" ao host e defina um nome de jogo (ex: teste)
- Aba 2: responda "no" ao host e use o mesmo nome de jogo

### 5. Histórico de lutas

    GET http://localhost:55555/api/history

## Ambiente de Produção

### 1. Suba os containers de produção

    docker compose -f docker-compose.prod.yml up --build

### 2. Acesse a aplicação

Abra o navegador em http://localhost (porta 80).

## Pipeline de CI/CD

- CI: lint, testes unitários, fuzzing e npm audit
- CodeQL SAST: análise estática de segurança
- SonarCloud: métricas de qualidade e cobertura
- CD: build e publicação das imagens no ghcr.io

Imagens publicadas em:
- ghcr.io/annacbrandao/gces-projetoindividual-app:latest
- ghcr.io/annacbrandao/gces-projetoindividual-nginx:latest

## Testes

    cd server
    npm install
    npm test

## Infraestrutura (Kubernetes)

Os manifestos estão em k8s/. Para aplicar em um cluster:

    kubectl apply -f k8s/namespace.yml
    kubectl apply -f k8s/postgres-secret.yml
    kubectl apply -f k8s/postgres-pvc.yml
    kubectl apply -f k8s/postgres-deployment.yml
    kubectl apply -f k8s/app-deployment.yml
    kubectl apply -f k8s/nginx-deployment.yml
    kubectl apply -f k8s/cert-manager-issuer.yml
    kubectl apply -f k8s/ingress.yml

O Ingress redireciona HTTP (porta 80) para HTTPS (porta 443) via Cert Manager com Let's Encrypt.
