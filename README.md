# TaskFlow — Gerenciador de Tarefas (CRUD)

Projeto de CRUD (Create, Read, Update, Delete) desenvolvido com **PHP + MySQL** no backend e **HTML, CSS e JavaScript puro** no frontend, consumindo uma API REST via `fetch`.

## Funcionalidades

- Cadastro e login de usuários (sessão PHP, senhas com `password_hash`/`password_verify`)
- Cada usuário só vê e gerencia as próprias tarefas
- Criar, listar, editar e excluir tarefas
- Filtro por status, prioridade e busca por texto (título/descrição)
- Painel com estatísticas (total, pendentes, em andamento, concluídas)
- Interface responsiva com modal de cadastro/edição

## Tecnologias

- PHP 8+ (PDO, prepared statements — proteção contra SQL Injection; sessões para autenticação)
- MySQL
- HTML5, CSS3, JavaScript (Fetch API, sem frameworks)

## Estrutura do projeto

```
gerenciador-tarefas-crud/
├── api/
│   └── tarefas.php        # API REST (GET, POST, PUT, DELETE) — protegida por login
├── config/
│   ├── database.php       # Conexão PDO com o MySQL
│   └── auth.php           # Sessão e helpers de autenticação
├── assets/
│   ├── css/style.css
│   └── js/app.js
├── schemas/database.sql   # Script de criação do banco + dados de exemplo
├── index.php               # Página principal (exige login)
├── login.php                # Página de login
├── cadastro.php             # Página de cadastro
├── logout.php                # Encerra a sessão
└── README.md
```

## Como rodar localmente

### 1. Pré-requisitos

Tenha um ambiente PHP + MySQL instalado, por exemplo o **[XAMPP](https://www.apachefriends.org/)** (mais simples no Windows) ou PHP + MySQL instalados separadamente.

### 2. Criar o banco de dados

Importe o arquivo `schemas/database.sql` no MySQL. Pode ser feito pelo phpMyAdmin (aba "Importar") ou via terminal:

```bash
mysql -u root -p < schemas/database.sql
```

Isso cria o banco `crud_tarefas`, as tabelas `usuarios` e `tarefas`, um usuário de demonstração e algumas tarefas de exemplo.

Usuário de demonstração: `demo@taskflow.com` / senha `demo123` (ou crie sua própria conta pela tela de cadastro).

### 3. Configurar a conexão (se necessário)

Por padrão, `config/database.php` usa usuário `root` sem senha (padrão do XAMPP). Se seu MySQL tiver outro usuário/senha, edite:

```php
$user = 'root';
$pass = '';
```

### 4. Rodar o servidor

**Opção A — XAMPP:** copie a pasta do projeto para `htdocs`, inicie Apache e MySQL no painel do XAMPP, e acesse:

```
http://localhost/gerenciador-tarefas-crud
```

**Opção B — servidor embutido do PHP** (sem precisar de Apache), na pasta do projeto:

```bash
php -S localhost:8000
```

E acesse `http://localhost:8000`.

## Possíveis melhorias (ideias para evoluir o projeto)

- Paginação da listagem
- Editar tarefas com drag-and-drop entre colunas (estilo Kanban)
- Deploy com Docker (PHP + MySQL em containers)
