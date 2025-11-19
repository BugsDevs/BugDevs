const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// ====================================================================
// ROTAS PÚBLICAS (Acesso para Clientes)
// ====================================================================

// Rota para Listar Todos os Produtos (PÚBLICA)
router.get('/', async (req, res) => {
  try {
    const produtos = await db.Produto.findAll();
    res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos (Público):', error);
    res.status(500).json({ error: 'Erro ao listar produtos', details: error.message });
  }
});

// Rota para Obter Produto por ID (PÚBLICA)
router.get('/:id', async (req, res) => {
  try {
    const produto = await db.Produto.findByPk(req.params.id);
    if (!produto) {
      return res.status(404).json({ error: 'Produto não encontrado' });
    }
    res.json(produto);
  } catch (error) {
    console.error('Erro ao obter produto por ID (Público):', error);
    res.status(500).json({ error: 'Erro ao obter produto', details: error.message });
  }
});

// ====================================================================
// ROTAS ADMINISTRATIVAS (CRUD)
// ====================================================================

// Rota para Adicionar Novo Produto (Apenas para Admin)
router.post('/', authenticateToken, authenticateAdmin, async (req, res) => {
  console.log('Requisição recebida para adicionar produto:', req.body);
  try {
    const { nome_produto, descricao, preco, estoque } = req.body;
    if (!nome_produto || !preco || !estoque) {
      throw new Error('Campos obrigatórios ausentes: nome_produto, preco, estoque');
    }

    const novoProduto = await db.Produto.create({ nome_produto, descricao, preco, estoque });
    
    res.status(201).json({ message: 'Produto cadastrado com sucesso', id: novoProduto.id_produto });
  } catch (error) {
    console.error('Erro ao cadastrar produto:', error);
    res.status(500).json({ error: 'Erro ao cadastrar produto', details: error.message });
  }
});

// Rota para Atualizar Produto (Apenas para Admin)
router.put('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  console.log(`Requisição recebida para atualizar produto ID: ${req.params.id}`, req.body);
  try {
    const [updated] = await db.Produto.update(req.body, {
      where: { id_produto: req.params.id }
    });

    if (updated) {
      const updatedProduto = await db.Produto.findByPk(req.params.id);
      res.status(200).json({ message: 'Produto atualizado com sucesso', produto: updatedProduto });
    } else {
      res.status(404).json({ error: 'Produto não encontrado para atualização' });
    }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).json({ error: 'Erro ao atualizar produto', details: error.message });
  }
});

// Rota para Deletar Produto (Apenas para Admin)
router.delete('/:id', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const deleted = await db.Produto.destroy({
      where: { id_produto: req.params.id }
    });

    if (deleted) {
      res.status(200).json({ message: 'Produto deletado com sucesso' });
    } else {
      res.status(404).json({ error: 'Produto não encontrado para exclusão' });
    }
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).json({ error: 'Erro ao deletar produto', details: error.message });
  }
});

module.exports = router;
