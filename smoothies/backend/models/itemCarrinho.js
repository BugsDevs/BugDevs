module.exports = (sequelize, DataTypes) => {
  const Carrinho = sequelize.define('Carrinho', {
    id_carrinho: { // Nova PK e AI, conforme solicitado
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cliente: { // Adicionando id_cliente, pois o carrinho agora é por item/cliente
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'clientes', key: 'id' }
    },
    id_produto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'produtos', key: 'id_produto' }
    },
    quantidade: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    preco_unitario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: { // Nova coluna de status, conforme solicitado
      type: DataTypes.ENUM('Ativo', 'Inativo'),
      defaultValue: 'Ativo'
    }
  }, {
    tableName: 'carrinho', // Renomeando a tabela, conforme solicitado
    timestamps: false
  });

  return Carrinho;
};