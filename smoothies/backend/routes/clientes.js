const express = require('express');
const router = express.Router();
const db = require('../models');
const { authenticateToken, authenticateAdmin } = require('../middleware/auth');

// ====================================================================
// ROTAS DE CLIENTE (Atualização de Perfil)
// ====================================================================

// Rota para Atualizar Perfil do Cliente (PUT /api/clientes/perfil) - Nova Rota
router.put('/perfil', authenticateToken, async (req, res) => {
  const id_cliente = req.user.id;
  console.log(`Requisição recebida para atualizar perfil do usuário: ${id_cliente}`, req.body);

  try {
    // Campos que o cliente pode atualizar
    const { nome, telefone, rua, numero, cidade, estado, cep, cpf } = req.body;
    
    const [updated] = await db.Cliente.update(
      { nome, telefone, rua, numero, cidade, estado, cep, cpf },
      { where: { id: id_cliente } }
    );

    if (updated) {
      const updatedCliente = await db.Cliente.findByPk(id_cliente, {
        attributes: { exclude: ['senha'] }
      });
      res.status(200).json({ message: 'Perfil atualizado com sucesso', cliente: updatedCliente });
    } else {
      res.status(404).json({ error: 'Cliente não encontrado ou nenhum dado para atualizar.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil', details: error.message });
  }
});

// ====================================================================
// ROTAS ADMINISTRATIVAS
// ====================================================================

// Rota para Listar Clientes (Apenas para Admin)
router.get('/', authenticateToken, authenticateAdmin, async (req, res) => {
  try {
    const clientes = await db.Cliente.findAll({
      attributes: { exclude: ['senha'] } // Exclui a senha por segurança
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    res.status(500).json({ error: 'Erro ao listar clientes', details: error.message });
  }
});

// Rota para Obter Cliente por ID (Apenas para Admin ou o próprio Cliente)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const clienteId = parseInt(req.params.id);
    const usuarioAutenticadoId = req.user.id;
    const usuarioAutenticadoTipo = req.user.tipo_usuario;

    // Verifica se o usuário é Admin ou se está tentando acessar o próprio perfil
    if (usuarioAutenticadoTipo !== 'admin' && usuarioAutenticadoId !== clienteId) {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para visualizar este cliente.' });
    }

    const cliente = await db.Cliente.findByPk(clienteId, {
      attributes: { exclude: ['senha'] } // Exclui a senha por segurança
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }

    res.json(cliente);
  } catch (error) {
    console.error('Erro ao obter cliente por ID:', error);
    res.status(500).json({ error: 'Erro ao obter cliente', details: error.message });
  }
});

module.exports = router;
