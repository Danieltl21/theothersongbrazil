# Plataforma LMS de Homeopatia - The Other Song Brasil (TOSB)

Este projeto é uma plataforma de cursos EAD (LMS) focada no nicho de Homeopatia, com perfis distintos para Alunos (Profissionais da Saúde), Professores Colaboradores e Administradores. O design visual foi inspirado na sobriedade, seriedade científica e sofisticação do site da **The Other Song Brasil (TOSB)**, trazendo uma experiência premium e moderna.

## 📁 Estrutura do Projeto

O projeto está dividido em duas partes principais, além de uma versão de demonstração instantânea:

```
lms-homeopatia/
├── client/                 # Front-end SPA desenvolvido em React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx         # Aplicação principal (com suporte a conexões reais e simulação local)
│   │   ├── index.css       # Design System em CSS Vanilla refinado (estilos TOSB)
│   │   └── main.jsx
│   ├── index.html          # Ponto de entrada carregando fontes premium (Outfit e Playfair Display)
│   ├── package.json
│   └── vite.config.js      # Configuração do Vite com proxy integrado para a API
│
├── server/                 # Back-end API REST desenvolvido em Node.js (Express)
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js    # Conexão com o PostgreSQL e auto-inicialização de tabelas
│   │   │   └── schema.sql  # Estrutura SQL completa com tabelas de negócio e sementes (seeds)
│   │   ├── middlewares/
│   │   │   └── auth.js     # Middleware JWT, logs de segurança e bloqueio de IPs simultâneos
│   │   ├── routes/
│   │   │   ├── auth.js     # Cadastro com aceite de termos de sigilo e login com travas de segurança
│   │   │   ├── courses.js  # Matrículas de 6 meses, progresso 60% assistido e quiz com max 2 tentativas
│   │   │   ├── payments.js # Checkout Sandbox do Asaas, cobranças Pix/Carnê e bloqueio por inadimplência
│   │   │   ├── conciliations.js # Parser de arquivos OFX e conciliação de pagamentos por código
│   │   │   └── reports.js  # Painéis acadêmicos dos professores e auditorias do administrador
│   │   └── index.js        # Inicialização do servidor Express
│   ├── .env                # Configurações de ambiente (portas, tokens, string do PostgreSQL)
│   └── package.json
│
└── demo.html               # 🌿 Demonstração Interativa Completa e Auto-contida!
```

---

## 🌿 Demonstração Instantânea (Sem Dependências)

Se você não tiver o Node.js instalado ou o banco PostgreSQL ativo em sua máquina no momento, você pode **testar 100% da plataforma e da identidade visual imediatamente**:

1. Vá até a pasta `C:\Users\erick\.gemini\antigravity\scratch\lms-homeopatia\`.
2. Dê um duplo clique no arquivo **[demo.html](file:///C:/Users/erick/.gemini/antigravity/scratch/lms-homeopatia/demo.html)**.
3. Ele abrirá no seu navegador Chrome, Edge ou Firefox preferido.
4. O arquivo contém todo o código React, os estilos premium e as lógicas de negócio rodando em um banco de dados local simulado (`localStorage`), permitindo testar:
   - **Login Rápido:** Entre como **Ana Paula** (Aluna), **Carlos Eduardo** (Professor) ou **Admin** usando as credenciais prontas.
   - **Trava de Segurança:** Marque o checkbox "Simular login em IP distante" ao logar como Ana para ver a conta ser temporariamente suspensa por compartilhamento de senhas (Opção B), e use o Portal de Segurança para reativá-la com o código de teste `123456`.
   - **Visualização & Progresso:** Dê play na aula de teste e observe a barra de progresso. Ao passar de 6 segundos (60% do vídeo simulado de 10s), a aula constará como concluída e a mensagem de encerramento do curso aparecerá!
   - **Quizzes:** Entre na aula de pós-graduação como Ana Paula, clique em "Responder Quiz". Teste a aprovação (acertando as duas perguntas) e veja a pontuação, ou tente errar para ver o consumo de tentativas (limite de 2, aprovação de 70%).
   - **Checkout Asaas & Carnês:** Faça uma assinatura de teste do Clube ou matrícula da Pós-Graduação, selecione Boleto Parcelado (Carnê) e clique em pagar na listagem para simular o Webhook do Asaas ativando o curso.
   - **Conciliação OFX:** Entre como Admin, clique em "Gerar OFX para Teste" para autopreencher um arquivo `.OFX` com códigos de faturas ativas pendentes, e processe a conciliação para ver o LMS aprovar o pagamento de forma automatizada.

---

## 🛠️ Como Executar a Versão Completa (Com Servidor e Banco Real)

Quando estiver pronto para rodar com banco de dados real PostgreSQL e servidores integrados:

### Passo 1: Configurar o PostgreSQL
1. Certifique-se de que o PostgreSQL está ativo em sua máquina.
2. Crie um banco de dados vazio chamado `lms_homeopatia`.
3. Abra o arquivo `server/.env` e ajuste a variável `DATABASE_URL` com o seu usuário e senha do Postgres:
   ```env
   DATABASE_URL=postgres://seu_usuario:sua_senha@localhost:5432/lms_homeopatia
   ```

### Passo 2: Inicializar o Servidor Backend (Node.js)
1. Instale o Node.js (caso ainda não tenha).
2. Abra seu terminal na pasta do servidor e execute:
   ```bash
   cd server
   npm install
   npm run dev
   ```
3. O servidor backend iniciará na porta `5000` e **executará automaticamente o script `schema.sql`**, criando todas as tabelas e inserindo os dados e professores de semente (seed).

### Passo 3: Inicializar o Cliente Frontend (Vite)
1. Abra um segundo terminal na pasta do cliente e execute:
   ```bash
   cd client
   npm install
   npm run dev
   ```
2. O Vite iniciará o servidor de desenvolvimento na porta `3000`. Acesse no seu navegador `http://localhost:3000`.
3. O proxy configurado no Vite enviará todas as chamadas de `/api` automaticamente para o servidor backend rodando na porta `5000`.

---

## 📋 Regras de Negócio Implementadas

1. **Acesso por 6 Meses:** As matrículas geradas após compras ou liberação de cursos livres possuem expiração fixa em 180 dias (`expires_at`), calculada no banco de dados.
2. **Presença Acadêmica:** A presença na Pós-Graduação exige cumulativamente assistir a pelo menos 60% do tempo do vídeo gravado + aprovação de 70% no Quiz correspondente da aula.
3. **Avaliações com Limites:** Quizzes de pós-graduação configurados para o máximo de 2 tentativas e nota de aprovação de 70%.
4. **Relatório de Professor Filtrado:** Professores colaboradores possuem área exclusiva contendo dados de presença, notas e status apenas de alunos matriculados nos cursos de autoria do docente (filtro no SQL por `teacher_id`).
5. **Inadimplência de Faturas:** Se o aluno atrasar o pagamento (seja assinatura ou carnê) por mais de 10 dias da data de vencimento (`due_date`), sua matrícula correspondente é marcada como `SUSPENDED` no banco de dados e seu login/visualização bloqueados até a quitação.
6. **Segurança de Acesso (Opção B):** Ao efetuar login, o sistema verifica se há sessão ativa daquele usuário com IP diferente da sessão atual. Se detectado, suspende a conta do usuário (`status = 'SUSPENDED'`), desloga todas as sessões anteriores e exige verificação por e-mail para desbloqueio (simulado com o código `123456` no portal de segurança).
7. **Conciliação OFX:** Mapeamento de transações bancárias do arquivo `.OFX` com os códigos de transação das faturas locais. Pagamentos pendentes que coincidem em código e valor são automaticamente marcados como quitados e suas matrículas associadas liberadas.
