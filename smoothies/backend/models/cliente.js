const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    nome: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    telefone: DataTypes.STRING,
    rua: DataTypes.STRING,
    numero: DataTypes.STRING,
    cidade: DataTypes.STRING,
    estado: DataTypes.STRING,
    cep: DataTypes.STRING,
    data_cadastro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    senha: { type: DataTypes.STRING(255), allowNull: false },
    tipo_usuario: { type: DataTypes.ENUM('cliente', 'admin'), defaultValue: 'cliente' },
    cpf: { type: DataTypes.STRING(14), allowNull: true }
  }, {
    indexes: [{ unique: false, fields: ['email'], name: 'idx_email' }],
    tableName: 'clientes',
    timestamps: false
  });
};