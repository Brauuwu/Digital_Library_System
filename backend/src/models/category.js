module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TheLoai', {
    ID_TheLoai: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    TenTheLoai: { type: DataTypes.STRING(100), allowNull: false }
  }, { tableName: 'TheLoai', timestamps: false });
};
