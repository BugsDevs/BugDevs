module.exports = (sequelize, DataTypes) => {
  const ItemVenda = sequelize.define('ItemVenda', {
    id_item: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    id_venda: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'vendas', key: 'id_venda' } },
    id_produto: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'produtos', key: 'id_produto' } },
    quantidade: { type: DataTypes.INTEGER, allowNull: false },
    preco_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
  }, { tableName: 'itens_venda', timestamps: false });

  return ItemVenda;
};