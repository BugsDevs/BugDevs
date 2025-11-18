const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Produto', {
    id_produto: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome_produto: { type: DataTypes.STRING(100), allowNull: false },
    descricao: { type: DataTypes.TEXT },
    preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    estoque: { type: DataTypes.INTEGER, defaultValue: 0 },
    disponivel: { type: DataTypes.BOOLEAN, defaultValue: true },
    imagem_url: { type: DataTypes.STRING(255), defaultValue: '../imgprodutos/placeholder.jpg' },
    criado_em: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    tableName: 'produtos',
    timestamps: false
  });
};