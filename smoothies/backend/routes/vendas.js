const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');
const { stringify } = require('csv-stringify');

// Rota para Finalizar Compra
router.post('/', authenticateToken, async (req, res) => {
  console.log('Requisição recebida para finalizar compra:', req.body);
  const t = await db.sequelize.transaction();
  try {
    // Usar o ID do usuário autenticado para garantir a segurança
    const id_usuario = req.user.id;
    const { itens, metodo_pagamento } = req.body;

    if (!itens || !metodo_pagamento) {
      throw new Error('Campos obrigatórios ausentes: itens, metodo_pagamento');
    }

    const total = itens.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);
    const venda = await db.Venda.create({
      id_usuario,
      total,
      data_venda: new Date(),
      metodo_pagamento
    }, { transaction: t });

    const itensVenda = itens.map(item => ({
      id_venda: venda.id_venda,
      id_produto: item.id_produto,
      quantidade: item.quantidade,
      preco_unitario: item.preco_unitario
    }));
    await db.ItemVenda.bulkCreate(itensVenda, { transaction: t });

    // Atualiza o estoque
    for (const item of itens) {
      await db.Produto.update(
        { estoque: db.sequelize.literal(`estoque - ${item.quantidade}`) },
        { where: { id_produto: item.id_produto }, transaction: t }
      );
    }

    await t.commit();
    console.log('Venda registrada com ID:', venda.id_venda);
    res.status(201).json({ message: 'Venda registrada', id: venda.id_venda });
  } catch (error) {
    await t.rollback();
    console.error('Erro ao registrar venda:', error);
    res.status(500).json({ error: 'Erro ao registrar venda', details: error.message });
  }
});

// ====================================================================
// ROTAS DE CLIENTE (Histórico de Pedidos)
// ====================================================================

// Rota para Listar Histórico de Pedidos do Cliente
router.get('/meus-pedidos', authenticateToken, async (req, res) => {
  console.log('Requisição recebida para histórico de pedidos. Usuário:', req.user.id);
  try {
    const id_usuario = req.user.id;

    const vendas = await db.Venda.findAll({
      where: { id_usuario },
      order: [['data_venda', 'DESC']]
    });

    res.status(200).json(vendas);
  } catch (error) {
    console.error('Erro ao listar histórico de pedidos:', error);
    res.status(500).json({ error: 'Erro ao listar pedidos', details: error.message });
  }
});

// Rota para Obter Detalhes de um Pedido Específico do Cliente
router.get('/meus-pedidos/:id_venda', authenticateToken, async (req, res) => {
  const id_venda = req.params.id_venda;
  const id_usuario = req.user.id;

  console.log(`Requisição recebida para detalhes do pedido ${id_venda}. Usuário: ${id_usuario}`);

  try {
    const venda = await db.Venda.findOne({
      where: { id_venda, id_usuario }, // Garante que o usuário só pode ver seus próprios pedidos
      include: [{ model: db.ItemVenda, as: 'ItensVenda' }] // Assumindo que há um relacionamento
    });

    if (!venda) {
      return res.status(404).json({ error: 'Pedido não encontrado ou não pertence ao usuário.' });
    }

    res.status(200).json(venda);
  } catch (error) {
    console.error('Erro ao obter detalhes do pedido:', error);
    res.status(500).json({ error: 'Erro ao obter detalhes do pedido', details: error.message });
  }
});

// ====================================================================
// ROTAS ADMINISTRATIVAS (Relatórios)
// ====================================================================

// Rota para Relatório de Vendas (Admin)
router.get('/relatorio', authenticateToken, authenticateAdmin, async (req, res) => {
  console.log('Gerando relatório de vendas...');
  try {
    const vendas = await db.Venda.findAll({
      include: [{ model: db.Cliente, as: 'Cliente', attributes: ['nome'] }]
    });

    stringify(vendas.map(v => ({
      id: v.id_venda,
      cliente: v.Cliente ? v.Cliente.nome : 'Desconhecido',
      total: v.total,
      data: new Date(v.data_venda).toISOString()
    })), { header: true }, (err, output) => {
      if (err) {
        console.error('Erro ao gerar CSV de vendas:', err);
        return res.status(500).json({ error: 'Erro ao gerar CSV de vendas', details: err.message });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio_vendas.csv"');
      res.send(output);
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de vendas:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório de vendas', details: error.message });
  }
});

// Rota para Relatório dos Mais Vendidos (Admin)
router.get('/mais-vendidos', authenticateToken, authenticateAdmin, async (req, res) => {
  console.log('Gerando relatório dos mais vendidos...');
  try {
    const maisVendidos = await db.sequelize.query(
      `SELECT p.id_produto, p.nome_produto, SUM(iv.quantidade) as total_vendido
       FROM produtos p
       LEFT JOIN itens_venda iv ON p.id_produto = iv.id_produto
       GROUP BY p.id_produto, p.nome_produto
       ORDER BY total_vendido DESC`,
      { type: db.sequelize.QueryTypes.SELECT }
    );

    stringify(maisVendidos.map(p => ({
      id_produto: p.id_produto,
      nome_produto: p.nome_produto,
      total_vendido: p.total_vendido || 0
    })), { header: true }, (err, output) => {
      if (err) {
        console.error('Erro ao gerar CSV dos mais vendidos:', err);
        return res.status(500).json({ error: 'Erro ao gerar CSV dos mais vendidos', details: err.message });
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio_mais_vendidos.csv"');
      res.send(output);
    });
  } catch (error) {
    console.error('Erro ao gerar relatório dos mais vendidos:', error);
    res.status(500).json({ error: 'Erro ao gerar relatório dos mais vendidos', details: error.message });
  }
});

module.exports = router;
