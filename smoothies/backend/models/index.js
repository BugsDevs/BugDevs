const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/config.json')['development'];
const sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: config.dialect
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Cliente = require('./cliente')(sequelize, DataTypes);
db.Produto = require('./produto')(sequelize, DataTypes);
db.Venda = require('./venda')(sequelize, DataTypes);
db.ItemVenda = require('./itemVenda')(sequelize, DataTypes);
// db.Carrinho = require('./carrinho')(sequelize, DataTypes); // Modelo Carrinho antigo comentado
db.Carrinho = require('./itemCarrinho')(sequelize, DataTypes); // Modelo ItemCarrinho renomeado para Carrinho (novo)

// Associações
db.Venda.belongsTo(db.Cliente, { foreignKey: 'id_usuario', as: 'Cliente' });
db.ItemVenda.belongsTo(db.Venda, { foreignKey: 'id_venda' });
db.ItemVenda.belongsTo(db.Produto, { foreignKey: 'id_produto' });
db.Carrinho.belongsTo(db.Cliente, { foreignKey: 'id_cliente' }); // Novo Carrinho (antigo ItemCarrinho)
// db.ItemCarrinho.belongsTo(db.Carrinho, { foreignKey: 'id_carrinho' }); // Associação antiga comentada
db.Carrinho.belongsTo(db.Produto, { foreignKey: 'id_produto' }); // Novo Carrinho (antigo ItemCarrinho)

module.exports = db;