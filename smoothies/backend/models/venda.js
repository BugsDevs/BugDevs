module.exports = (sequelize, DataTypes) => {
  const Venda = sequelize.define('Venda', {
    id_venda: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_usuario: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'clientes', key: 'id' } },
    total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    data_venda: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    metodo_pagamento: { type: DataTypes.ENUM('dinheiro', 'cartao', 'pix'), allowNull: true }
  }, { tableName: 'vendas', timestamps: false });

  return Venda;
};