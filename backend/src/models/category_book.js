module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TheLoai_Sach', {
    ID_TheLoai: { type: DataTypes.INTEGER, primaryKey: true },
    ID_Sach: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'TheLoai_Sach', timestamps: false });
};
