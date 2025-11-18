module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('clientes', {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome: { type: Sequelize.STRING(100), allowNull: false },
      email: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      telefone: { type: Sequelize.STRING(20) },
      rua: { type: Sequelize.STRING(100) },
      numero: { type: Sequelize.STRING(10) },
      cidade: { type: Sequelize.STRING(50) },
      estado: { type: Sequelize.STRING(2) },
      cep: { type: Sequelize.STRING(10) },
      data_cadastro: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      senha: { type: Sequelize.STRING(255), allowNull: false },
      tipo_usuario: { type: Sequelize.ENUM('cliente', 'admin'), defaultValue: 'cliente' },
      cpf: { type: Sequelize.STRING(14), allowNull: true }
    }, { indexes: [{ unique: true, fields: ['email'] }] });

    await queryInterface.createTable('produtos', {
      id_produto: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      nome_produto: { type: Sequelize.STRING(100), allowNull: false },
      descricao: { type: Sequelize.TEXT },
      preco: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      estoque: { type: Sequelize.INTEGER, defaultValue: 0 },
      disponivel: { type: Sequelize.BOOLEAN, defaultValue: true },
      imagem_url: { type: Sequelize.STRING(255), defaultValue: '../imgprodutos/placeholder.jpg' },
      criado_em: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    }, { indexes: [{ unique: true, fields: ['id_produto'] }] });

    await queryInterface.createTable('vendas', {
      id_venda: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_usuario: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      total: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      data_venda: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
      metodo_pagamento: { type: Sequelize.ENUM('dinheiro', 'cartao', 'pix'), allowNull: true }
    }, { indexes: [{ unique: true, fields: ['id_venda'] }] });

    await queryInterface.createTable('itens_venda', {
      id_item: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      id_venda: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'vendas', key: 'id_venda' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      id_produto: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'produtos', key: 'id_produto' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      quantidade: { type: Sequelize.INTEGER, allowNull: false },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false }
    }, { indexes: [{ unique: true, fields: ['id_item'] }] });

// Tabela 'carrinhos' removida conforme solicitação.
    // await queryInterface.createTable('carrinhos', {
    //   id_carrinho: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
    //   id_cliente: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
    //   status: { type: Sequelize.ENUM('aberto', 'finalizado'), defaultValue: 'aberto' },
    //   criado_em: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
    // }, { indexes: [{ unique: true, fields: ['id_carrinho'] }] });

    // Tabela 'itens_carrinho' renomeada para 'carrinho' e alterada conforme solicitação.
    await queryInterface.createTable('carrinho', {
      id_carrinho: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true }, // Nova PK e AI
      id_cliente: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' }, // Mantém a referência ao cliente
      id_produto: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'produtos', key: 'id_produto' }, onDelete: 'CASCADE', onUpdate: 'CASCADE' },
      quantidade: { type: Sequelize.INTEGER, allowNull: false },
      preco_unitario: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      status: { type: Sequelize.ENUM('Ativo', 'Inativo'), defaultValue: 'Ativo' } // Nova coluna de status
    }, { indexes: [{ unique: true, fields: ['id_carrinho'] }] });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('carrinho'); // Nova tabela
    // await queryInterface.dropTable('itens_carrinho'); // Tabela renomeada
    // await queryInterface.dropTable('carrinhos'); // Tabela removida
    await queryInterface.dropTable('itens_venda');
    await queryInterface.dropTable('vendas');
    await queryInterface.dropTable('produtos');
    await queryInterface.dropTable('clientes');
  }
};