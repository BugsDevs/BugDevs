// module.exports = (sequelize, DataTypes) => {
//   const Carrinho = sequelize.define('Carrinho', {
//     id_carrinho: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true
//     },
//     id_cliente: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       references: { model: 'clientes', key: 'id' }
//     },
//     status: {
//       type: DataTypes.ENUM('aberto', 'finalizado'),
//       defaultValue: 'aberto'
//     },
//     criado_em: {
//       type: DataTypes.DATE,
//       defaultValue: DataTypes.NOW
//     }
//   }, {
//     tableName: 'carrinhos',
//     timestamps: false
//   });

//   return Carrinho;
// };