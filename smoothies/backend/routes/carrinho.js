const express = require('express');
const router = express.Router();
const db = require("../models");
const { authenticateToken } = require("../middleware/auth");

// Rota para Adicionar Produto ao Carrinho (POST - Create/Update)
router.post('/', authenticateToken, async (req, res) => {
  console.log('Requisição recebida para adicionar/atualizar item no carrinho:', req.body);
  console.log('Usuário autenticado:', req.user);
  try {
    // id_cliente é obtido do token, garantindo que o usuário autenticado está adicionando ao seu próprio carrinho
    const id_cliente = req.user.id;
    const { id_produto, quantidade, preco_unitario } = req.body;

    if (!id_produto || !quantidade || !preco_unitario) {
      throw new Error('Campos obrigatórios ausentes: id_produto, quantidade, preco_unitario');
    }

    // Tenta encontrar um item de carrinho existente para o mesmo cliente e produto com status 'Ativo'
    let itemCarrinho = await db.Carrinho.findOne({
      where: {
        id_cliente,
        id_produto,
        status: 'Ativo'
      }
    });

    if (itemCarrinho) {
      // Se o item existe, apenas atualiza a quantidade
      itemCarrinho.quantidade += quantidade;
      await itemCarrinho.save();
      console.log('Quantidade do item atualizada no carrinho. ID:', itemCarrinho.id_carrinho);
    } else {
      // Se o item não existe, cria um novo item de carrinho
      itemCarrinho = await db.Carrinho.create({
        id_cliente,
        id_produto,
        quantidade,
        preco_unitario,
        status: 'Ativo'
      });
      console.log('Novo item adicionado ao carrinho. ID:', itemCarrinho.id_carrinho);
    }

    res.status(201).json({ message: 'Item adicionado/atualizado no carrinho', id: itemCarrinho.id_carrinho });
  } catch (error) {
    console.error('Erro ao adicionar item:', error);
    res.status(500).json({ error: 'Erro ao adicionar item', details: error.message });
  }
});

// Rota para Visualizar o Carrinho (GET)
router.get('/', authenticateToken, async (req, res) => {
  console.log('Requisição recebida para visualizar carrinho. Usuário:', req.user.id);
  try {
    const id_cliente = req.user.id;

    const itensCarrinho = await db.Carrinho.findAll({
      where: {
        id_cliente,
        status: 'Ativo'
      },
      include: [{ model: db.Produto, as: 'Produto' }] // Assumindo que há um relacionamento definido
    });

    if (!itensCarrinho || itensCarrinho.length === 0) {
      return res.status(200).json({ message: 'Carrinho vazio', itens: [] });
    }

    const totalCarrinho = itensCarrinho.reduce((sum, item) => sum + item.quantidade * item.preco_unitario, 0);

    res.status(200).json({
      message: 'Itens do carrinho recuperados com sucesso',
      total: totalCarrinho,
      itens: itensCarrinho
    });
  } catch (error) {
    console.error('Erro ao visualizar carrinho:', error);
    res.status(500).json({ error: 'Erro ao visualizar carrinho', details: error.message });
  }
});

// Rota para Atualizar a Quantidade de um Item no Carrinho (PUT)
router.put('/:id_carrinho', authenticateToken, async (req, res) => {
  const id_carrinho = req.params.id_carrinho;
  const id_cliente = req.user.id;
  const { quantidade } = req.body;

  console.log(`Requisição recebida para atualizar item ID: ${id_carrinho} com quantidade: ${quantidade}`);

  try {
    if (quantidade === undefined || isNaN(quantidade) || quantidade < 0) {
      return res.status(400).json({ error: 'Quantidade inválida. Deve ser um número não negativo.' });
    }

    const itemCarrinho = await db.Carrinho.findOne({
      where: {
        id_carrinho,
        id_cliente, // Garante que o usuário só pode atualizar seus próprios itens
        status: 'Ativo'
      }
    });

    if (!itemCarrinho) {
      return res.status(404).json({ error: 'Item do carrinho não encontrado ou não pertence ao usuário.' });
    }

    if (quantidade === 0) {
      // Se a quantidade for 0, deleta o item
      await itemCarrinho.destroy();
      return res.status(200).json({ message: 'Item removido do carrinho (quantidade zero).' });
    }

    // Atualiza a quantidade
    itemCarrinho.quantidade = quantidade;
    await itemCarrinho.save();

    res.status(200).json({ message: 'Quantidade do item atualizada com sucesso', item: itemCarrinho });
  } catch (error) {
    console.error('Erro ao atualizar item do carrinho:', error);
    res.status(500).json({ error: 'Erro ao atualizar item do carrinho', details: error.message });
  }
});

// Rota para Remover um Item do Carrinho (DELETE)
router.delete('/:id_carrinho', authenticateToken, async (req, res) => {
  const id_carrinho = req.params.id_carrinho;
  const id_cliente = req.user.id;

  console.log(`Requisição recebida para deletar item ID: ${id_carrinho}`);

  try {
    const deleted = await db.Carrinho.destroy({
      where: {
        id_carrinho,
        id_cliente, // Garante que o usuário só pode deletar seus próprios itens
        status: 'Ativo'
      }
    });

    if (deleted) {
      res.status(200).json({ message: 'Item removido do carrinho com sucesso' });
    } else {
      res.status(404).json({ error: 'Item do carrinho não encontrado ou não pertence ao usuário.' });
    }
  } catch (error) {
    console.error('Erro ao deletar item do carrinho:', error);
    res.status(500).json({ error: 'Erro ao deletar item do carrinho', details: error.message });
  }
});

// Rota para Limpar o Carrinho (DELETE /api/carrinho) - Nova Rota
router.delete('/', authenticateToken, async (req, res) => {
  const id_cliente = req.user.id;

  console.log(`Requisição recebida para limpar o carrinho do usuário: ${id_cliente}`);

  try {
    const deletedCount = await db.Carrinho.destroy({
      where: {
        id_cliente,
        status: 'Ativo'
      }
    });

    if (deletedCount > 0) {
      res.status(200).json({ message: `${deletedCount} itens removidos. Carrinho limpo com sucesso.` });
    } else {
      res.status(200).json({ message: 'Carrinho já estava vazio.' });
    }
  } catch (error) {
    console.error('Erro ao limpar o carrinho:', error);
    res.status(500).json({ error: 'Erro ao limpar o carrinho', details: error.message });
  }
});

module.exports = router;
