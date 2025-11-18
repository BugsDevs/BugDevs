const express = require('express');
const isTest = process.env.NODE_ENV === 'test';
const cors = require('cors');
const db = require('./models');
const { authenticateToken, authenticateAdmin } = require('./middleware/auth');

// Importação dos arquivos de rotas (CORRIGIDO para apontar para a pasta 'routes')
const authRoutes = require('./routes/autenticacao');
const cartRoutes = require('./routes/carrinho');
const productRoutes = require('./routes/produtos');
const saleRoutes = require('./routes/vendas');
const clientRoutes = require('./routes/clientes');

const app = express();
const port = 3000;

const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// ====================================================================
// USO DAS ROTAS ORGANIZADAS
// ====================================================================

// Rotas de Autenticação (Cadastro e Login)
app.use('/', authRoutes); // Rotas: /cadastro, /login

// Rotas de Carrinho
app.use('/api/carrinho', cartRoutes); // Rotas: /api/carrinho (POST, GET, DELETE), /api/carrinho/:id (PUT, DELETE)

// Rotas de Produtos
app.use('/api/produtos', productRoutes); // Rotas: /api/produtos (GET Público, POST Admin), /api/produtos/:id (GET Público, PUT Admin, DELETE Admin)

// Rotas de Vendas
app.use('/api/vendas', saleRoutes); // Rotas: /api/vendas (POST), /api/vendas/meus-pedidos (GET), /api/vendas/relatorio (GET Admin), /api/vendas/mais-vendidos (GET Admin)

// Rotas de Clientes
app.use('/api/clientes', clientRoutes); // Rotas: /api/clientes (GET Admin), /api/clientes/:id (GET Admin/Cliente), /api/clientes/perfil (PUT Cliente)

// ====================================================================
// INICIALIZAÇÃO DO SERVIDOR
// ====================================================================

// Teste de Conexão com o Banco
db.sequelize.authenticate()
  .then(() => console.log('Conexão com o banco estabelecida com sucesso.'))
  .catch(err => console.error('Erro ao conectar ao banco:', err));

// Inicia o servidor apenas se não estiver em ambiente de teste
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port} em ${new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}`);
  });
}

module.exports = app;