module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Sach', {
    ID_Sach: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ID_NXB: { type: DataTypes.INTEGER },
    ISBN: { type: DataTypes.STRING(30), unique: true },
    TieuDeSach: { type: DataTypes.STRING(200), allowNull: false },
    NamXuatBan: { type: DataTypes.INTEGER },
    SoLuongCon: { type: DataTypes.INTEGER, defaultValue: 0 }
  }, { tableName: 'Sach', timestamps: false });
};
