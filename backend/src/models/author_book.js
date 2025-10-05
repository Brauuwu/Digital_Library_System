module.exports = (sequelize, DataTypes) => {
  return sequelize.define('TacGia_Sach', {
    ID_TacGia: { type: DataTypes.INTEGER, primaryKey: true },
    ID_Sach: { type: DataTypes.INTEGER, primaryKey: true }
  }, { tableName: 'TacGia_Sach', timestamps: false });
};
