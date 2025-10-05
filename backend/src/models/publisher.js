module.exports = (sequelize, DataTypes) => {
  return sequelize.define('NhaXuatBan', {
    ID_NXB: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenNXB: { type: DataTypes.STRING(100), allowNull: false },
    DiaChi: { type: DataTypes.STRING(200) },
    Website: { type: DataTypes.STRING(200) }
  }, { tableName: 'NhaXuatBan', timestamps: false });
};
