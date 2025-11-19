const express = require('express');
const router = express.Router();
const db = require('../models'); // Assumindo que models está no mesmo nível ou acessível
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Rota de Cadastro
router.post('/cadastro', async (req, res) => {
  console.log('Corpo recebido:', req.body);
  try {
    const { nome, email, senha_hash, telefone, rua, numero, cidade, estado, cep, cpf } = req.body;
    if (!nome || !email || !senha_hash) {
      throw new Error('Campos obrigatórios ausentes');
    }
    const hashedSenha = await bcrypt.hash(senha_hash, 10);
    const cliente = await db.Cliente.create({ nome, email, senha: hashedSenha, telefone, rua, numero, cidade, estado, cep, cpf });
    res.status(201).json({ message: 'Cliente cadastrado', id: cliente.id });
  } catch (error) {
    console.error('Erro no cadastro:', error);
    res.status(500).json({ error: 'Erro ao cadastrar', details: error.message });
  }
});

// Rota de Login
router.post('/login', async (req, res) => {
  try {
    const { email, senha_hash } = req.body;
    const cliente = await db.Cliente.findOne({ where: { email } });
    if (!cliente || !(await bcrypt.compare(senha_hash, cliente.senha))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    // O segredo deve ser carregado de uma variável de ambiente, mas manterei o hardcode por enquanto
    const token = jwt.sign({ id: cliente.id, email: cliente.email, tipo_usuario: cliente.tipo_usuario }, 'seu_segredo_aqui', { expiresIn: '1h' });
    res.json({ 
        message: 'Login bem-sucedido', 
        token,
        tipo_usuario: cliente.tipo_usuario 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro ao fazer login', details: error.message });
  }
});

module.exports = router;
